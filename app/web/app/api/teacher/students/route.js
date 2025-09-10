import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const schoolId = url.searchParams.get('schoolId');

    if (!schoolId) {
      return Response.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    // Get all students from the school with their latest progress
    const students = await sql`
      SELECT 
        s.*,
        sp.overall_score,
        sp.risk_level,
        sp.date_recorded as last_progress_update
      FROM students s
      LEFT JOIN student_progress sp ON s.student_id = sp.student_id
      LEFT JOIN (
        SELECT student_id, MAX(date_recorded) as latest_date
        FROM student_progress 
        GROUP BY student_id
      ) latest ON s.student_id = latest.student_id AND sp.date_recorded = latest.latest_date
      WHERE s.school_id = ${schoolId}
      AND s.status = 'active'
      ORDER BY s.class_level, s.section, s.name
    `;

    return Response.json({
      success: true,
      students
    });

  } catch (error) {
    console.error("Error fetching students:", error);
    return Response.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
