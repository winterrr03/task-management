const Task = require("../models/task.model");

const paginationHelper = require("../../../helpers/pagination.helper");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
  const userId = res.locals.user.id;

  const find = {
    $or: [
      { createdBy: userId },
      { listUser: userId }
    ],
    deleted: false,
  };

  if (req.query.status) {
    find.status = req.query.status;
  }

  // Sắp xếp
  const sort = {};

  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  }
  // Hết Sắp xếp

  // Tìm kiếm
  if (req.query.keyword) {
    const regex = new RegExp(req.query.keyword, "i");
    find.title = regex;
  }
  // Hết Tìm kiếm

  // Phân trang
  const countTasks = await Task.countDocuments(find);
  const objectPagination = paginationHelper(req, countTasks);
  // Hết Phân trang

  const tasks = await Task
                .find(find)
                .limit(objectPagination.limitItems)
                .skip(objectPagination.skip)
                .sort(sort);

  res.json({
    code: 200,
    message: "Thành công",
    tasks: tasks
  });
};

// [GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
  const id = req.params.id;

  const task = await Task.findOne({
    _id: id,
    deleted: false,
  });

  res.json(task);
};

// [PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;

    await Task.updateOne({
      _id: id
    }, {
      status: status
    });

    res.json({
      code: 200,
      message: "Cập nhật trạng thái thành công!"
    }); 
  } catch (error) {
    res.json({
      code: 400,
      message: "Không tồn tại bản ghi!"
    });
  }
};

// [PATCH] /api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
  const { ids, status } = req.body;

  const listStatus = ["initial", "doing", "finish", "pending", "notFinish"];

  if(listStatus.includes(status)) {
    await Task.updateMany({
      _id: { $in: ids }
    }, {
      status: status
    });

    res.json({
      code: 200,
      message: "Đổi trạng thái thành công!"
    });
  } else {
    res.json({
      code: 400,
      message: `Trạng thái ${status} không hợp lệ!`
    });
  }
};

// [POST] /api/v1/tasks/create
module.exports.create = async (req, res) => {
  req.body.createdBy = res.locals.user.id;
  const task = new Task(req.body);
  await task.save();

  res.json({
    code: 200,
    message: "Tạo công việc thành công!"
  });
}

// [PATCH] /api/v1/tasks/edit/:id
module.exports.edit = async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  await Task.updateOne({
    _id: id
  }, data);

  res.json({
    code: 200,
    message: "Cập nhật công việc thành công!"
  });
};

// [DELETE] /api/v1/tasks/delete/:id
module.exports.delete = async (req, res) => {
  const id = req.params.id;

  await Task.updateOne({
    _id: id
  }, {
    deleted: true,
    deletedAt: new Date()
  });

  res.json({
    code: 200,
    message: "Xóa công việc thành công!"
  });
};

// [PATCH] /api/v1/tasks/delete-multi
module.exports.deleteMulti = async (req, res) => {
  const { ids } = req.body;

  await Task.updateMany({
    _id: { $in: ids }
  }, {
    deleted: true,
    deletedAt: new Date()
  });

  res.json({
    code: 200,
    message: "Xóa các công việc thành công!"
  });
};