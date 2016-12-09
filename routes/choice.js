/**
 * Created by Administrator on 2016/8/14.
 * 试题和数据库的结合 ---- 选择题
 */
//引进相应的模块
var express = require('express');
var router = express.Router();
//操作数据库
var monk = require('monk');
//访问数据库
var db = monk('localhost:27017/qmaker');

//路由设置
router.get('/', function(req, res) {
    var collection = db.get('choice');
    collection.find({},function(err, questions) {
        if(err) throw err;
        res.json(questions);
    });
});

//保存一条单选题的数据
router.post('/', function(req, res) {
    var collection = db.get('choice');
    collection.insert({
        content:req.body.content,
        options:req.body.options,
        tag:req.body.tag,
        type:req.body.type,
        answer:req.body.answer
    },function(err, choice) {
        if(err) throw  err;
        res.json(choice);
    });
});

//删除一条单选题的数据
router.delete('/:id', function(req, res){
    var collection = db.get('choice');
    collection.remove({
        _id: req.params.id
    }, function(err, choice) {
        if(err) throw err;
        res.json(choice);
    });
});

//通过id获取一条具体的数据
router.get('/:id', function(req, res) {
    var collection = db.get('choice');
    collection.findOne({
        _id:req.params.id
    },function(err, choice) {
        if(err) throw err;
        res.json(choice);
    });
});

/**
 * 通过类型id查找数据
 */
router.get('/type/:id',function(req, res) {
    var collection = db.get('choice');
    collection.find({
        type:req.params.id
    }, function(err,choices) {
        if(err) throw err;
        res.json(choices);
    });
});

/**
 * 通过标签查找数据
 */
router.get('/tag/:tag', function(req, res) {
    var collection = db.get('choice');
    collection.find({
        tag : req.params.tag
    }, function(err, choices) {
        if(err) throw err;
        res.json(choices);
    });
});

/**
 * 通过指定的类型和标签查找数据
 */
router.get('/type/:id/:tag' ,function(req, res) {
    var collection = db.get('choice');
    collection.find({
        type: req.params.id,
        tag: req.params.tag
    }, function(err, choices) {
        if(err) throw err;
        res.json(choices);
    })
});

/**
 * 通过指定的id更新一条数据
 */
router.put('/:id', function(req, res) {
    var collection = db.get('choice');
    collection.update({
        _id: req.params.id
    },{
        content:req.body.content,
        options:req.body.options,
        tag:req.body.tag,
        type:req.body.type,
        answer:req.body.answer
    },function(err, choice) {
        if(err) throw err;
        res.json(choice);
    });
});

router.put('/tag/:tag', function(req, res) {
    var collection = db.get('choice');
    collection.update({
        tag: req.params.tag
    },{
        content:req.body.content,
        options:req.body.options,
        tag:req.body.tag,
        type:req.body.type,
        answer:req.body.answer
    },function(err, choice) {
        if(err) throw err;
        res.json(choice);
    });
});

router.delete('/tag/:tag', function(req, res){
    var collection = db.get('choice');
    collection.remove({
        tag: req.params.tag
    }, function(err, choice) {
        if(err) throw err;
        res.json(choice);
    });
});


//暴露该对象
module.exports = router;
