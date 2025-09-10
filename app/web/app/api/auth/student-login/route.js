import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { studentId, dateOfBirth } = await request.json();

    if (!studentId || !dateOfBirth) {
      return Response.json(
        { error: "Student ID and Date of Birth are required" },
        { status: 400 }
      );
    }

    // Validate student credentials
    const students = await sql`
      SELECT s.*, sc.name as school_name, sc.board 
      FROM students s
      JOIN schools sc ON s.school_id = sc.school_id
      WHERE s.student_id = ${studentId} 
      AND s.date_of_birth = ${dateOfBirth}
      AND s.status = 'active'
    `;

    if (students.length === 0) {
      return Response.json(
        { error: "Invalid credentials or student not found" },
        { status: 401 }
      );
    }

    const student = students[0];

    // Get latest progress data
    const progress = await sql`
      SELECT * FROM student_progress 
      WHERE student_id = ${studentId} 
      ORDER BY date_recorded DESC 
      LIMIT 1
    `;

    return Response.json({
      success: true,
      student: {
        id: student.student_id,
        name: student.name,
        class: student.class_level,
        section: student.section,
        school: student.school_name,
        board: student.board,
        profilePicture: student.profile_picture,
        progress: progress[0] || null
      }
    });

  } catch (error) {
    console.error("Student login error:", error);
    return Response.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
