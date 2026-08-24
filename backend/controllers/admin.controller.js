import Department from "../models/department.model.js";
import User from "../models/user.model.js";

export const getAddDepartment = (req, res) => {
  res.render("admin/add-department", {
    title: "Add Department",
    error: null,
    success: null,
  });
};

export const postAddDepartment = async (req, res) => {
  try {
    const { name, programType, address } = req.body;

    if (!name || !programType || !address) {
      return res.render("admin/add-department", {
        title: "Add Department",
        error: "All fields are required!",
        success: null,
      });
    }

    // Check for duplicate
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.render("admin/add-department", {
        title: "Add Department",
        error: "Department with this name already exists!",
        success: null,
      });
    }

    const department = new Department({
      name,
      programType,
      address,
      createdBy: req.admin?._id,
    });

    await department.save();
    res.redirect("/admin/departments?success=Department created successfully!");

  } catch (err) {
    console.error("Error creating department:", err);
    res.render("admin/add-department", {
      title: "Add Department",
      error: "Something went wrong. Please try again!",
      success: null,
    });
  }
};

// Show all departments with pagination, search, and filter
export const getAllDepartments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const filterType = req.query.type || "";

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (filterType) {
      query.programType = filterType;
    }

    // Get total count for pagination
    const totalDepartments = await Department.countDocuments(query);
    const totalPages = Math.ceil(totalDepartments / limit);

    // Get departments with pagination
    const departments = await Department.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get user count for each department
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const userCount = await User.countDocuments({ department: dept.name });
        return { ...dept, userCount };
      })
    );

    res.render("admin/departments", {
      title: "Departments",
      departments: departmentsWithCount,
      success: req.query.success || null,
      currentPage: page,
      totalPages,
      totalDepartments,
      search,
      filterType,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

export const getDepartmentsApi = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const filterType = req.query.type || "";

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (filterType) {
      query.programType = filterType;
    }

    const totalDepartments = await Department.countDocuments(query);
    const totalPages = Math.ceil(totalDepartments / limit);

    const departments = await Department.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const userCount = await User.countDocuments({ department: dept.name });
        return { ...dept, userCount };
      })
    );

    res.json({
      departments: departmentsWithCount,
      currentPage: page,
      totalPages,
      totalDepartments,
      search,
      filterType,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllDepartmentsApi = async (req, res) => {
  try {
    const departments = await Department.find()
      .sort({ name: 1 })
      .select("name programType address")
      .lean();

    res.json({ departments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getDepartmentApi = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).lean();
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    res.json({ department });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const createDepartmentApi = async (req, res) => {
  try {
    const { name, programType, address } = req.body;

    if (!name || !programType || !address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "Department with this name already exists" });
    }

    const department = new Department({
      name,
      programType,
      address,
      createdBy: req.admin?._id,
    });

    await department.save();
    res.status(201).json({ success: true, department });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateDepartmentApi = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const { name, programType, address } = req.body;

    if (!name || !programType || !address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const existing = await Department.findOne({ name, _id: { $ne: departmentId } });
    if (existing) {
      return res.status(400).json({ error: "Department with this name already exists" });
    }

    const oldName = department.name;
    department.name = name;
    department.programType = programType;
    department.address = address;
    await department.save();

    if (oldName !== name) {
      await User.updateMany({ department: oldName }, { department: name });
    }

    res.json({success: true, department});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteDepartmentApi = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const userCount = await User.countDocuments({ department: department.name });
    if (userCount > 0) {
      return res.status(400).json({
        error: `Cannot delete department with ${userCount} active users`,
      });
    }

    await Department.findByIdAndDelete(departmentId);
    res.json({ success: true, message: "Department deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getEditDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.redirect("/admin/departments?error=Department not found");
    }

    res.render("admin/edit-department", {
      title: "Edit Department",
      department,
      error: null,
    });
  } catch (err) {
    console.error("Error fetching department:", err);
    res.redirect("/admin/departments?error=Something went wrong");
  }
};

export const postEditDepartment = async (req, res) => {
  try {
    const { name, programType, address } = req.body;
    const departmentId = req.params.id;

    // Validate required fields
    if (!name || !programType || !address) {
      const department = await Department.findById(departmentId);
      return res.render("admin/edit-department", {
        title: "Edit Department",
        department,
        error: "All fields are required!",
      });
    }

    // Check for duplicate name
    const existing = await Department.findOne({
      name,
      _id: { $ne: departmentId },
    });

    if (existing) {
      const department = await Department.findById(departmentId);
      return res.render("admin/edit-department", {
        title: "Edit Department",
        department,
        error: "Department with this name already exists!",
      });
    }

    await Department.findByIdAndUpdate(departmentId, {
      name,
      programType,
      address,
    });

    res.redirect("/admin/departments?success=Department updated successfully!");
  } catch (err) {
    console.error("Error updating department:", err);
    const department = await Department.findById(req.params.id);
    res.render("admin/edit-department", {
      title: "Edit Department",
      department,
      error: "Something went wrong. Please try again!",
    });
  }
};

// Handle Department Delete
export const deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;
    const department = await Department.findById(departmentId);

    if (!department) {
      return res.redirect("/admin/departments?error=Department not found");
    }

    const userCount = await User.countDocuments({department: department.name});

    if (userCount > 0) {
      return res.redirect(
        `/admin/departments?error=Cannot delete department with ${userCount} active users`
      );
    }

    await Department.findByIdAndDelete(departmentId);
    res.redirect("/admin/departments?success=Department deleted successfully!");

  } catch (err) {
    console.error("Error deleting department:", err);
    res.redirect("/admin/departments?error=Something went wrong");
  }
};

// Admin Dashboard

export const getDashboardStats = async (req, res) => {
  try {
    const departmentCount = await Department.countDocuments();
    const userCount = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: "student" });
    const professorCount = await User.countDocuments({ role: "professor" });
    const hodCount = await User.countDocuments({ role: "hod" });

    return res.json({departmentCount,userCount,studentCount,professorCount,hodCount,});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const departmentCount = await Department.countDocuments();
    const userCount = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: "student" });
    const professorCount = await User.countDocuments({ role: "professor" });
    const hodCount = await User.countDocuments({ role: "hod" });

    res.render("admin/admin-dashboard", {
      admin: req.admin,
      departmentCount,
      userCount,
      studentCount,
      professorCount,
      hodCount,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
