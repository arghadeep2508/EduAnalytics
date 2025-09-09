import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { studentId, question, type = 'query' } = await request.json();

    if (!studentId || !question) {
      return Response.json(
        { error: "Student ID and question are required" },
        { status: 400 }
      );
    }

    let response = "";
    let contextData = {};

    // Get student data for context
    const student = await sql`
      SELECT s.*, sc.name as school_name, sc.board 
      FROM students s
      JOIN schools sc ON s.school_id = sc.school_id
      WHERE s.student_id = ${studentId}
    `;

    if (student.length === 0) {
      return Response.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const studentData = student[0];

    // Simple rule-based chatbot responses
    const questionLower = question.toLowerCase();

    if (questionLower.includes('attendance') || questionLower.includes('present')) {
      const attendance = await sql`
        SELECT COUNT(*) as total, SUM(CASE WHEN present THEN 1 ELSE 0 END) as present
        FROM attendance 
        WHERE student_id = ${studentId}
        AND date_recorded >= CURRENT_DATE - INTERVAL '30 days'
      `;
      
      const attendanceData = attendance[0];
      const rate = attendanceData.total > 0 ? Math.round((attendanceData.present / attendanceData.total) * 100) : 0;
      
      response = `Hi ${studentData.name}! Your attendance rate for the last 30 days is ${rate}%. You were present for ${attendanceData.present} out of ${attendanceData.total} days.`;
      contextData = { attendanceRate: rate, presentDays: attendanceData.present, totalDays: attendanceData.total };

    } else if (questionLower.includes('marks') || questionLower.includes('score') || questionLower.includes('grade')) {
      const marks = await sql`
        SELECT AVG((marks_obtained::float / total_marks) * 100) as average_percentage
        FROM marks 
        WHERE student_id = ${studentId}
        AND date_assessed >= CURRENT_DATE - INTERVAL '30 days'
      `;
      
      const avgScore = marks[0]?.average_percentage ? Math.round(marks[0].average_percentage) : 0;
      response = `Your average score in recent assessments is ${avgScore}%. Keep up the good work and focus on areas where you can improve!`;
      contextData = { averageScore: avgScore };

    } else if (questionLower.includes('help') || questionLower.includes('counselor') || questionLower.includes('support')) {
      response = `I'm here to help you, ${studentData.name}! You can ask me about your attendance, marks, or academic progress. If you need to speak with a counselor, you can use the "Ask Counselor" button on your dashboard.`;

    } else if (questionLower.includes('progress') || questionLower.includes('performance')) {
      const progress = await sql`
        SELECT overall_score, risk_level 
        FROM student_progress 
        WHERE student_id = ${studentId}
        ORDER BY date_recorded DESC 
        LIMIT 1
      `;
      
      if (progress.length > 0) {
        const progressData = progress[0];
        const riskMessage = progressData.risk_level === 'safe' ? 'You\'re doing great!' : 
                           progressData.risk_level === 'warning' ? 'You need to focus more on your studies.' :
                           'Please consider speaking with a counselor for additional support.';
        
        response = `Your current overall score is ${progressData.overall_score}/100. Status: ${progressData.risk_level}. ${riskMessage}`;
        contextData = { overallScore: progressData.overall_score, riskLevel: progressData.risk_level };
      } else {
        response = "I don't have enough progress data yet. Keep attending classes and completing assessments!";
      }

    } else if (questionLower.includes('mcq') || questionLower.includes('question') || questionLower.includes('practice')) {
      // Get a random MCQ for the student's class and board
      const mcqs = await sql`
        SELECT * FROM mcq_questions 
        WHERE class_level = ${studentData.class_level}
        AND board = ${studentData.board}
        ORDER BY RANDOM()
        LIMIT 1
      `;
      
      if (mcqs.length > 0) {
        const mcq = mcqs[0];
        response = `Here's a practice question for you:\n\n${mcq.question}\n\nA) ${mcq.option_a}\nB) ${mcq.option_b}\nC) ${mcq.option_c}\nD) ${mcq.option_d}\n\nThink about it and let me know your answer!`;
        contextData = { mcqId: mcq.id, correctAnswer: mcq.correct_answer, subject: mcq.subject };
      } else {
        response = "I don't have any practice questions available for your class right now. Please check back later!";
      }

    } else {
      response = `Hello ${studentData.name}! I can help you with information about your attendance, marks, progress, and provide practice questions. What would you like to know?`;
    }

    // Save the interaction
    await sql`
      INSERT INTO chatbot_interactions (student_id, question, response, interaction_type, context_data)
      VALUES (${studentId}, ${question}, ${response}, ${type}, ${JSON.stringify(contextData)})
    `;

    return Response.json({
      success: true,
      response,
      contextData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Chatbot error:", error);
    return Response.json(
      { error: "Failed to process question" },
      { status: 500 }
    );
  }
}
