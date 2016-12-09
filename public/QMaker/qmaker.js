/**
 * Created by Administrator on 2016/8/14.
 */
var app = angular.module('QMaker',['ui.router', 'ui.bootstrap','ngResource']);
/**
 * 在根路径上引用$state,$stateParams两个对象，方便其他地方直接引进
 */
app.run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
}]);

/**
 * 路由配置
 * 使用的是ui-router，可以对视图进行嵌套使用
 */
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url:'/home',
            templateUrl: '/partials/home.html'
        })
        .state('editQuestion', {
            url: '/editQuestion/:id/:type',
            templateUrl: function($stateParams) {
                if($stateParams.type == 1) {
                    return '/partials/choice.html'
                }else if($stateParams.type == 2) {
                    return '/partials/checkBox.html'
                }else if($stateParams.type == 3){
                    return '/partials/judge.html'
                }else if($stateParams.type == 4){
                    return '/partials/pack.html'
                }else if($stateParams.type == 5){
                    return '/partials/programme.html'
                }
            },
            controller: 'editQuestionCtrl'
        })
        .state('addQuestion', {
            url:'/addQuestion/:id',
            //通过id控制模板
            templateUrl: function($stateParams) {
                if($stateParams.id == 1) {
                    return '/partials/choice.html'
                }else if($stateParams.id == 2) {
                    return '/partials/checkBox.html'
                }else if($stateParams.id == 3){
                    return '/partials/judge.html'
                }else if($stateParams.id == 4){
                    return '/partials/pack.html'
                }else if($stateParams.id == 5){
                    return '/partials/programme.html'
                }
            },
            controller: 'addQuestionCtrl'
        })
        .state('questionList', {
            url: '/questionList',
            templateUrl: '/partials/questionList.html',
            controller: 'QuestionListCtrl'
         })
        .state('questionTag', {
            url: '/questionTag',
            templateUrl: '/partials/questionTag.html',
            controller: 'QuestionTagCtrl'
        });
    $urlRouterProvider.otherwise('/home');
}]);

/**
 * 试题标签控制器
 */
app.controller('QuestionTagCtrl', ['$scope', '$resource', '$uibModal', '$stateParams', '$location',  function($scope, $resource, $uibModal, $stateParams, $location) {
    $scope.TagList = [];
    var Questions = $resource('/api/choice');
    Questions.query(function(questions) {
        questionTagInit(questions);
    });
    //数据按标签进行分类
    var questionTagInit = function(questions) {
        if(questions.length != 0){
            //获取所有标签
            for(var i = 0;i<questions.length;i++){
                if($scope.TagList.length != 0){
                    var ifNew = false;
                    for(var j = 0;j< $scope.TagList.length;j++){
                        if($scope.TagList[j].name == questions[i].tag) {
                            $scope.TagList[j].options.push(questions[i]);
                            ifNew = true;
                        }
                    }
                    if(!ifNew) {
                        var tagChild = {
                            name: questions[i].tag,
                            options: []
                        };
                        tagChild.options.push(questions[i]);
                        $scope.TagList.push(tagChild);
                        ifNew = true;
                    }
                }else{
                    var tag = {
                        name: questions[i].tag,
                        options: []
                    };
                    tag.options.push(questions[i]);
                    $scope.TagList.push(tag);
                }
            }
        }
    };
    /**
     * 修改标签
     * @param tagName
     */
    $scope.questionTagEdit = function(tagName) {
        $scope.item = tagName;
        //打开模态框
        var modalInstance = $uibModal.open({
            templateUrl: '/partials/questionTagEditModels.html',//模板内容
            controller: 'EditModalCtrl',//模板控制器
            backdrop:true,
            resolve: {
                items1: function () {
                    return $scope.item;
                }
            }
        });
        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        },function(){
        });

        //切换动画属性
        $scope.toggleAnimation = function () {
            $scope.animationsEnabled = !$scope.animationsEnabled;
        };
    };

    /**
     * 标签删除操作
     * @param tagName
     * ===========================================
     * 待解决的问题，删除一个标签模块后刷新本页面，与修改更新后一样
     * ===========================================
     */
    $scope.questionTagDelete = function(tagName) {
        var questionsTag = $resource('/api/choice/tag/' + tagName);
        questionsTag.delete({
            tag:$stateParams.tag
        },function(q) {

        });
    };

    /**
     * 标签查看数据
     * @param tagName
     */
    $scope.questionTagFind = function(tagName) {
        var QuestionFind = $resource('/api/choice/tag/' + tagName);
        QuestionFind.query(function(questions) {
            $scope.questions = questions;
            $scope.questionLength = $scope.questions.length;
            $location.path('/questionList');
        });
    }
}]);

app.controller('EditModalCtrl',['$scope', '$uibModalInstance',  'items1', '$location','$resource',  function($scope, $uibModalInstance,items1,$location,$resource) {
    $scope.item = items1;
    //关闭模态框
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    /**
     * 修改标签
     * @constructor
     * ===========================================================
     * 还需要解决的问题
     * 数据更新后不会刷新页面，问题应该是$scope中的数据没有改变
     * 一个再嵌套的问题
     * =========================================================
     */
    $scope.TagEditSure = function() {
        //关闭模态框
        $uibModalInstance.close();
        //获取修改前后的值
        var oldTagName = items1;
        var newTagName = $scope.item;
        //更新操作
        var questionTags = $resource('/api/choice/tag/' + oldTagName, null ,{
            update: {
                method:'PUT'
            }
        });
        questionTags.query(function(questions) {
            for(var i = 0;i<questions.length;i++) {
                var question = questions[i];
                question.tag = newTagName;
                questionTags.update(question);
            }
        });
    }
}]);

/**
 * 查询和删除操作
 */
app.controller('QuestionListCtrl', ['$scope', '$resource', '$stateParams', function($scope, $resource, $stateParams) {
    $scope.islActive = {'id' : 0,'name' :'不限'};
    $scope.isTypeActive = '不限';
    var Questions = $resource('/api/choice');
    Questions.query(function(questions) {
        $scope.questionTags = ['不限'];
        $scope.questions = questions;
        $scope.questionLength = questions.length;
        for(var i = 0;i< $scope.questionLength;i++){
            if($scope.questions[i].tag != null){
                if($scope.questionTags.indexOf($scope.questions[i].tag) == -1 && $scope.questionTags.length != 0){
                    $scope.questionTags.push($scope.questions[i].tag);
                }else if($scope.questionTags.length == 0){
                    $scope.questionTags.push($scope.questions[i].tag);
                }
            }
        }
        $scope.Tags = $scope.questionTags.length - 1;
    });
    //删除操作
    $scope.deleteQuestion = function(question) {
        var QuestionsDelete = $resource('/api/choice/' + question._id);
        QuestionsDelete.delete({
            id:$stateParams.id
        },function(q) {
            $scope.questions.splice($scope.questions.indexOf(question), 1);
            $scope.questionLength = $scope.questions.length;
        });
    };
    //通过类型id查询数据
    $scope.findOneByType = function(item) {
        $scope.islActive = item;
        var QuestionFind;
        if(item.id == 0) {
            if($scope.isTypeActive == '不限'){
                QuestionFind = $resource('/api/choice');
            }else{
                QuestionFind = $resource('/api/choice/tag/' + $scope.isTypeActive);
            }
        }else {
            if($scope.isTypeActive == '不限') {
                QuestionFind = $resource('/api/choice/type/' + item.id);
            }else{
                QuestionFind = $resource('/api/choice/type/' + item.id + '/' + $scope.isTypeActive);
            }
        }
        QuestionFind.query(function(questions) {
            $scope.questions = questions;
            $scope.questionLength = $scope.questions.length;
        });
    };
    /**
     * 通过标签查找数据
     * @param qt
     */
    $scope.findOneByTag = function(qt) {
        $scope.isTypeActive = qt;
        var QuestionFind;
        if(qt == '不限') {
            if($scope.islActive.id == 0){
                QuestionFind = $resource('/api/choice');
            }else{
                QuestionFind = $resource('/api/choice/type/' + $scope.islActive.id);
            }
        }else{
            if($scope.islActive.id == 0){
                QuestionFind = $resource('/api/choice/tag/' + $scope.isTypeActive);
            }else{
                QuestionFind = $resource('/api/choice/type/' + $scope.islActive.id + '/' + $scope.isTypeActive);
            }
        }
        QuestionFind.query(function(questions) {
            $scope.questions = questions;
            $scope.questionLength = $scope.questions.length;
        });
    }
}]);

/**
 * 编辑操作
 */
app.controller('editQuestionCtrl', ['$scope', '$resource', '$stateParams','$location', function($scope, $resource, $stateParams, $location){
    var Questions = $resource('/api/choice/:id',{
        id: '@_id'
    },{
        update: {
            method: 'PUT'
        }
    });
    Questions.get({
        id: $stateParams.id
    }, function(question) {
        $scope.formData = question;
    });
    //添加选项
    $scope.addOption = function(){
        $scope.formData.options.push({name: ''})
    };
    //删除选项
    $scope.removeOption = function(index) {
        $scope.formData.options.splice(index, 1);
    };
    //更新保存操作
    $scope.saveQuestion = function() {
        Questions.update($scope.formData, function() {
            $location.path('/questionList');
        });
    }
}]);

/**
 * 主控制器
 */
app.controller('QMakerCtrl',['$scope', '$uibModal', function($scope, $uibModal) {
    $scope.items = [
        {'id':0,'name':'不限'},
        {'id':1,'name':'单选题'},
        {'id':2,'name':'多选题'},
        {'id':3,'name':'判断题'},
        {'id':4,'name':'填空题'},
        {'id':5,'name':'编程题'}
    ];
    $scope.open = function(size) {
        //打开模态框
        var modalInstance = $uibModal.open({
            templateUrl: '/partials/Modals.html',//模板内容
            controller: 'ModalCtrl',//模板控制器
            backdrop:true,
            size: size,
            resolve: {
                items1: function () {
                    return $scope.items;
                }
            }
        });
        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        },function(){
        });
    };
    //切换动画属性
    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };
}]);

/**
 * 添加试题控制器
 */
app.controller('addQuestionCtrl',['$scope', '$stateParams', '$location', '$resource', function($scope, $stateParams, $location, $resource) {
    //添加试题的类型
    var questionType = $stateParams.id;
    if(questionType == 1){
        //单选题
        $scope.formData = {
            type: questionType,
            answer: 0,
            options: [{}, {}, {}, {}],
            name : '',
            tag: ''
        };
    }else if(questionType == 2) {
        //多选题
        $scope.formData = {
            type : questionType,
            options :[{name:'' ,selected : true },{name:'' ,selected : false},{name:'' ,selected : false},{name:'' ,selected : false}],
            name : '',
            tag: ''
        };
    }else if(questionType == 3){
        //判断题
        $scope.formData = {
            type:questionType,
            options:[{name : '说法正确'},{name : '说法错误'}],
            name : '',
            tag : '',
            answer : 0
        }
    }else if(questionType == 5) {
        //编程题
        $scope.formData = {
            type:questionType,
            description: '',//描述，即题干
            print: '',//输入
            output: '',//输出
            samplePrint: '',//样例输入
            sampleOutput: '',//样例输出
            cue:'',//提示
            tag:''//标签
        }
    }
    //添加选项
    $scope.addOption = function(){
        if(questionType == 1){
            $scope.formData.options.push({name: ''});
        }else if(questionType == 2){
            $scope.formData.options.push({name: '',selected : false});
        }
    };
    //删除选项
    $scope.removeOption = function(index) {
        $scope.formData.options.splice(index, 1);
    };
    //保存试题
    $scope.saveQuestion = function() {
        var Choice = $resource('/api/choice');
        Choice.save($scope.formData, function() {
            $location.path('/questionList');
        });
    }
}]);

/**
 * 模态框控制器
 */
app.controller('ModalCtrl', ['$scope', '$uibModalInstance', 'items1', '$location',  function($scope, $uibModalInstance,items1,$location) {
    //传递到模态框的数据
    $scope.items = items1;
    //关闭模态框
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.addQuestion = function(id) {
        $uibModalInstance.close();
        var path = '/addQuestion/'+id;
        $location.path(path);
    }
}]);



/**
 * 筛选器，控制选项为大写字母
 */
app.filter('optionStr', function(){
    return function(index){
        return String.fromCharCode(index + 65);
    }
});

/**
 * 筛选器，控制题目的类型
 */
app.filter('typeStr', function() {
    return function(index){
        if(index == 1) {
            return "单选题";
        }else if(index == 2) {
            return "多选题";
        }else if(index == 3) {
            return "判断题";
        }else if(index == 4){
            return "填空题"
        }else if(index == 5) {
            return "编程题"
        }
    }
});

/**
 * 筛选器，控制多选答案的显示
 */
app.filter('selectedStr', function() {
    return function(options){
        var str = '';
        for(var i = 0;i<options.length;i++){
            if(options[i].selected){
                str += String.fromCharCode(i + 65);
            }
        }
        return str;
    }
});


