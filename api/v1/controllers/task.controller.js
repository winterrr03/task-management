const Task = require("../models/task.model");

const paginationHelper = require("../../../helpers/pagination.helper");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
  const find = {
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

  res.json(tasks);
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
