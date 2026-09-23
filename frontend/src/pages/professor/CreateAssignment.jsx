import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateAssignment.css";

const axios = {
  get: async (url, options = {}) => {
    const response = await fetch(url, { credentials: options.withCredentials ? "include" : "same-origin" });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return { data };
  },
  post: async (url, body, options = {}) => {
    const response = await fetch(url, {
      method: "POST",
      credentials: options.withCredentials ? "include" : "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return { data };
  },
};

const CreateAssignment = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);

  const [assignmentType, setAssignmentType] =
    useState("department");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Assignment",
    department: "",
    dueDate: "",
    maxMarks: 100,
  });

  const [selectedStudents, setSelectedStudents] =
    useState([]);

  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // GET DEPARTMENTS
  // ==========================================

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "/api/professor/departments",
        {
          withCredentials: true,
        }
      );

      setDepartments(
        response.data.departments || []
      );
    } catch (error) {
      console.error(
        "Department error:",
        error
      );
    }
  };

  // ==========================================
  // GET STUDENTS
  // ==========================================

  useEffect(() => {
    if (assignmentType === "students") {
      fetchStudents();
    }
  }, [assignmentType]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        "/api/professor/students",
        {
          withCredentials: true,
        }
      );

      setStudents(response.data.students || []);
    } catch (error) {
      console.error(
        "Student error:",
        error
      );
    }
  };

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // SELECT STUDENT
  // ==========================================

  const handleStudentChange = (studentId) => {
    setSelectedStudents((previous) => {
      if (previous.includes(studentId)) {
        return previous.filter(
          (id) => id !== studentId
        );
      }

      return [
        ...previous,
        studentId,
      ];
    });
  };

  // ==========================================
  // FILE
  // ==========================================

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ==========================================
  // CREATE ASSIGNMENT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title) {
      alert("Enter assignment title");
      return;
    }

    if (!form.dueDate) {
      alert("Select due date");
      return;
    }

    if (
      assignmentType === "department" &&
      !form.department
    ) {
      alert("Select a department");
      return;
    }

    if (
      assignmentType === "students" &&
      selectedStudents.length === 0
    ) {
      alert("Select at least one student");
      return;
    }

    try {
      setLoading(true);

      /*
        For now we send the Cloudinary URL
        as fileUrl.

        If your existing Cloudinary upload
        middleware is available, we can connect
        it in the next step.
      */

      const data = {
        title: form.title,
        description: form.description,
        category: form.category,

        assignmentType,

        department:
          assignmentType === "department"
            ? form.department
            : "",

        assignedStudents:
          assignmentType === "students"
            ? selectedStudents
            : [],

        dueDate: form.dueDate,

        maxMarks: Number(
          form.maxMarks
        ),

        fileUrl: "",
      };

      const response = await axios.post(
        "http://localhost:5000/api/assignments",
        data,
        {
          withCredentials: true,
        }
      );

      navigate("/professor/dashboard", {
        state: { message: response.data.message || "Assignment created successfully" },
      });

    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to create assignment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-assignment-page">

      <div className="create-assignment-card">

        <div className="page-header">
          <h1>Create Assignment</h1>

          <p>
            Create an assignment and assign it
            to your students.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* TITLE */}

          <div className="form-group">

            <label>
              Assignment Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Java OOP Assignment"
              required
            />

          </div>


          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the assignment..."
              rows="5"
            />

          </div>


          {/* CATEGORY */}

          <div className="form-group">

            <label>
              Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="Assignment">
                Assignment
              </option>

              <option value="Thesis">
                Thesis
              </option>

              <option value="Report">
                Report
              </option>
            </select>

          </div>


          {/* ASSIGN TO */}

          <div className="form-group">

            <label>
              Give Assignment To
            </label>

            <div className="assignment-type">

              <label>
                <input
                  type="radio"
                  value="department"
                  checked={
                    assignmentType ===
                    "department"
                  }
                  onChange={(e) => {
                    setAssignmentType(
                      e.target.value
                    );

                    setSelectedStudents([]);
                  }}
                />

                Entire Department
              </label>


              <label>
                <input
                  type="radio"
                  value="students"
                  checked={
                    assignmentType ===
                    "students"
                  }
                  onChange={(e) => {
                    setAssignmentType(
                      e.target.value
                    );

                    setForm({
                      ...form,
                      department: "",
                    });
                  }}
                />

                Selected Students
              </label>

            </div>

          </div>


          {/* DEPARTMENT */}

          {assignmentType ===
            "department" && (

            <div className="form-group">

              <label>
                Department
              </label>

              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Department
                </option>

                {departments.map(
                  (department) => (

                  <option
                    key={department._id}
                    value={
                      department.name
                    }
                  >
                    {department.name}
                  </option>

                ))}

              </select>

            </div>

          )}


          {/* STUDENTS */}

          {assignmentType ===
            "students" && (

            <div className="form-group">

              <label>
                Select Students
              </label>

              <div className="student-list">

                {students.length === 0 ? (

                  <p>
                    No students found.
                  </p>

                ) : (

                  students.map(
                    (student) => (

                    <label
                      key={student._id}
                      className="student-item"
                    >

                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(
                          student._id
                        )}
                        onChange={() =>
                          handleStudentChange(
                            student._id
                          )
                        }
                      />

                      <span>
                        {student.name}
                      </span>

                      <small>
                        {student.department}
                      </small>

                    </label>

                  ))

                )}

              </div>

            </div>

          )}


          {/* DUE DATE */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Due Date
              </label>

              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-group">

              <label>
                Maximum Marks
              </label>

              <input
                type="number"
                name="maxMarks"
                min="1"
                value={form.maxMarks}
                onChange={handleChange}
              />

            </div>

          </div>

          {/* FILE */}

<div className="form-group">

  <label>
    Assignment File
  </label>

  <input
    type="file"
    onChange={handleFileChange}
    accept=".pdf,.doc,.docx,.ppt,.pptx"
  />

  {file && (
    <p className="file-name">
      Selected: {file.name}
    </p>
  )}

</div>



          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="create-button"
          >

            {loading
              ? "Creating..."
              : "Create Assignment"}

          </button>

        </form>

      </div>

    </div>
  );
};

export default CreateAssignment;
