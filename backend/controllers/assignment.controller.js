import Assignment from '../models/assignment.model.js';


export const createAssignment = async (req ,res)=>{
    try{
        const {title,description,category,department, dueDate, maxMarks,fileUrl, assignmentType, assignedStudents} = req.body;

        if(!title || !category || !dueDate || (assignmentType === "department" && !department)){
            return res.status(400).json({message:"Please provide all required fields"});
        }
        if(!req.user || !req.user._id){
            return res.status(401).json({message:"Unauthorized"});
        }


        const assignment =  await Assignment.create({
            title,
            description:description || "",
            category,
            department,
            professorId:req.user._id,
            dueDate,
            assignmentType: assignmentType || "department",
            assignedStudents: assignedStudents || [],
            status: "active",
            maxMarks:maxMarks || 100,
            fileUrl:fileUrl || "",
        })

        const populatedAssignment = await Assignment.findById(assignment._id)
        .populate("professorId","name email");

        return res.status(201).json({success:true,message:"Assignment created",assignment:populatedAssignment});
    }catch(error){
        console.log("Assignment creation error",error);
        return res.status(500).json({success: false,message: "Failed to create assignment",error: error.message,});
    }
};

export const getProfessorAssignments = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({success: false,message: "User not authenticated",});
    }

    const assignments =await Assignment.find({professorId: req.user._id,})
        .populate("professorId", "name email")
        .sort({ createdAt: -1 });

    return res.status(200).json({success: true,count: assignments.length,assignments,});
    }catch (error) {
    console.error("Get Professor Assignments Error:", error);

    return res.status(500).json({success: false,message: "Failed to get assignments",error: error.message,});
  }
};

export const getStudentAssignments = async (req,res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const department = req.user.department;
    if (!department) {
      return res.status(400).json({
        success: false,
        message:"Student is not assigned to a department",
      });
    }

    const assignments =
      await Assignment.find({
        department,
      })
        .populate("professorId", "name email")
        .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error(
      "Get Student Assignments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get student assignments",
      error: error.message,
    });
  }
};


export const getAssignmentById = async (req,res) => {
  try {
    const { id } = req.params;

    const assignment =await Assignment.findById(id)
        .populate("professorId", "name email");

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error(
      "Get Assignment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get assignment",
      error: error.message,
    });
  }
};

export const deleteAssignment = async (req,res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (assignment.professorId.toString() !== req.user._id.toString()){
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this assignment",
      });
    }

    await Assignment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Assignment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
      error: error.message,
    });
  }
};
