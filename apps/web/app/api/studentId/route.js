import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { studentId } = params;

    // Get student progress data for the last 30 days
    const progressData = await sql`
      SELECT 
        date_recorded,
        overall_score,
        attendance_percentage,
        academic_performance,
        behavior_score,
        risk_level
      FROM student_progress 
      WHERE student_id = ${studentId}
      ORDER BY date_recorded DESC
      LIMIT 30
    `;

    // Get recent attendance
    const attendance = await sql`
      SELECT date_recorded, present 
      FROM attendance 
      WHERE student_id = ${studentId}
      ORDER BY date_recorded DESC
      LIMIT 30
    `;

    // Get recent marks
    const marks = await sql`
      SELECT 
        subject,
        assessment_type,
        marks_obtained,
        total_marks,
        date_assessed
      FROM marks 
      WHERE student_id = ${studentId}
      ORDER BY date_assessed DESC
      LIMIT 20
    `;

    // Calculate current metrics
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.present).length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    const totalMarks = marks.reduce((sum, m) => sum + m.marks_obtained, 0);
    const maxMarks = marks.reduce((sum, m) => sum + m.total_marks, 0);
    const academicPercentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

    // Calculate overall score (weighted average)
    const overallScore = (attendanceRate * 0.3) + (academicPercentage * 0.7);

    // Determine risk level
    let riskLevel = 'safe';
    if (overallScore < 40) riskLevel = 'at-risk';
    else if (overallScore < 60) riskLevel = 'warning';

    return Response.json({
      success: true,
      data: {
        currentMetrics: {
          overallScore: Math.round(overallScore),
          attendanceRate: Math.round(attendanceRate),
          academicPercentage: Math.round(academicPercentage),
          riskLevel
        },
        progressHistory: progressData.reverse(), // Chronological order
        recentAttendance: attendance.slice(0, 10).reverse(),
        recentMarks: marks.slice(0, 10).reverse()
      }
    });

  } catch (error) {
    console.error("Error fetching student progress:", error);
    return Response.json(
      { error: "Failed to fetch progress data" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { studentId } = params;
    const { date, overallScore, attendancePercentage, academicPerformance, behaviorScore } = await request.json();

    // Determine risk level based on overall score
    let riskLevel = 'safe';
    if (overallScore < 40) riskLevel = 'at-risk';
    else if (overallScore < 60) riskLevel = 'warning';

    // Insert new progress record
    await sql`
      INSERT INTO student_progress (
        student_id, date_recorded, overall_score, attendance_percentage, 
        academic_performance, behavior_score, risk_level
      ) VALUES (
        ${studentId}, ${date}, ${overallScore}, ${attendancePercentage},
        ${academicPerformance}, ${behaviorScore}, ${riskLevel}
      )
    `;

    return Response.json({
      success: true,
      message: "Progress data updated successfully"
    });

  } catch (error) {
    console.error("Error updating student progress:", error);
    return Response.json(
      { error: "Failed to update progress data" },
      { status: 500 }
    );
  }
}
