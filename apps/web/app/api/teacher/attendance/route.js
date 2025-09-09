import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { attendanceData, teacherId } = await request.json();

    if (!attendanceData || !Array.isArray(attendanceData) || !teacherId) {
      return Response.json(
        { error: "Attendance data array and teacher ID are required" },
        { status: 400 }
      );
    }

    // Insert attendance records
    const insertPromises = attendanceData.map(record => {
      return sql`
        INSERT INTO attendance (student_id, date_recorded, present, teacher_id, remarks)
        VALUES (${record.studentId}, ${record.date}, ${record.present}, ${teacherId}, ${record.remarks || null})
        ON CONFLICT (student_id, date_recorded) 
        DO UPDATE SET 
          present = EXCLUDED.present,
          teacher_id = EXCLUDED.teacher_id,
          remarks = EXCLUDED.remarks
      `;
    });

    await Promise.all(insertPromises);

    // Update student progress for each student
    for (const record of attendanceData) {
      await updateStudentProgress(record.studentId);
    }

    return Response.json({
      success: true,
      message: `Attendance recorded for ${attendanceData.length} students`
    });

  } catch (error) {
    console.error("Error recording attendance:", error);
    return Response.json(
      { error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}

// Helper function to update student progress
async function updateStudentProgress(studentId) {
  try {
    // Calculate attendance rate for last 30 days
    const attendance = await sql`
      SELECT COUNT(*) as total, SUM(CASE WHEN present THEN 1 ELSE 0 END) as present
      FROM attendance 
      WHERE student_id = ${studentId}
      AND date_recorded >= CURRENT_DATE - INTERVAL '30 days'
    `;

    // Calculate academic performance from recent marks
    const marks = await sql`
      SELECT AVG((marks_obtained::float / total_marks) * 100) as avg_percentage
      FROM marks 
      WHERE student_id = ${studentId}
      AND date_assessed >= CURRENT_DATE - INTERVAL '30 days'
    `;

    const attendanceData = attendance[0];
    const marksData = marks[0];

    const attendanceRate = attendanceData.total > 0 ? (attendanceData.present / attendanceData.total) * 100 : 0;
    const academicPerformance = marksData.avg_percentage || 0;

    // Calculate overall score (weighted: 30% attendance, 70% academic)
    const overallScore = (attendanceRate * 0.3) + (academicPerformance * 0.7);

    // Determine risk level
    let riskLevel = 'safe';
    if (overallScore < 40) riskLevel = 'at-risk';
    else if (overallScore < 60) riskLevel = 'warning';

    // Insert or update progress record
    await sql`
      INSERT INTO student_progress (
        student_id, date_recorded, overall_score, attendance_percentage, 
        academic_performance, behavior_score, risk_level
      ) VALUES (
        ${studentId}, CURRENT_DATE, ${Math.round(overallScore)}, ${Math.round(attendanceRate)},
        ${Math.round(academicPerformance)}, 80, ${riskLevel}
      )
      ON CONFLICT (student_id, date_recorded)
      DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        attendance_percentage = EXCLUDED.attendance_percentage,
        academic_performance = EXCLUDED.academic_performance,
        risk_level = EXCLUDED.risk_level,
        calculated_at = CURRENT_TIMESTAMP
    `;

  } catch (error) {
    console.error(`Error updating progress for student ${studentId}:`, error);
  }
}
