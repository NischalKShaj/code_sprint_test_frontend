export async function getStudentData(studentId: string) {
  // Fetch data for a single student by ID
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/profile/user/${studentId}`
  );
  const data = await response.json();
  return data;
}

export async function getTutorData(tutorId: string) {
  // Fetch data for a single student by ID
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/profile/tutor/${tutorId}`
  );
  const data = await response.json();
  return data;
}
