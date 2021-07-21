var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');
var handlebars = require('handlebars');

var url = 'mongodb://localhost:27017/Mydatabase';

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/get-data', function(req, res, next) {
  var resultArray = [];
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    var cursor = db.collection('project').find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function() {
      db.close();
      res.render('index', {items: resultArray});
    });
  });
});

router.post('/insert', function(req, res, next) {
  var item = {
    pname: req.body.pname,
    client: req.body.client,
    type: req.body.type,
    date1: req.body.date1,
    date2: req.body.date2
  };
  let errors = [];
  var date1= req.body.date1
  var date2= req.body.date2
  var day1= parseInt((date1.toString()).slice(8,10))
  var day2= parseInt((date2.toString()).slice(8,10))
  var month1= parseInt((date1.toString()).slice(5,7))
  var month2= parseInt((date2.toString()).slice(5,7))
  var year1= parseInt((date1.toString()).slice(0,4))
  var year2= parseInt((date2.toString()).slice(0,4))
  if (month1 > month2 || day1 > day2 ) {
    errors.push({text:'Error : Real date must be superior than Delivery date.'})
  }
  if ( year1 !== year2 ) {
      errors.push({text:"Error : Difference between Delivery and Real date can't surpass a year."})
  }
  if (errors.length > 0) {
    res.render('index' , {
      errors:errors,
      title:'Error'
    });
  }
  else {
    mongo.connect(url, function(err, db) {
      assert.equal(null, err);
      db.collection('project').insertOne(item, function(err, result) {
        assert.equal(null, err);
        console.log('Item inserted');
        db.close();
      });
    });
     res.redirect('/');
  }
});

router.get('/update', function(req, res, next) {

  handlebars.registerHelper("if", function(num1, num2, options) {
    var month1 = parseInt((num1.toString()).slice(5,7));
    var month2 = parseInt((num2.toString()).slice(5,7));
    var day1 = parseInt((num1.toString()).slice(8,10));
    var day2 = parseInt((num2.toString()).slice(8,10));
      if (month1 !== month2 || day1 !== day2) {
        if (month2 > month1 || day2 > day1) {
         return options.fn(this);
        }
      }

  });
  
 handlebars.registerHelper("lateMonth", function(mon1, mon2, options) { 
       var month1 = parseInt((mon1.toString()).slice(5,7));
       var month2 = parseInt((mon2.toString()).slice(5,7));
           return options.fn(month2-month1);
      });
  handlebars.registerHelper("lateDay", function(data1, data2, options) { 
        var day1 = parseInt((data1.toString()).slice(8,10));
        var day2 = parseInt((data2.toString()).slice(8,10));
            return options.fn(day2-day1);
     });

  var resultArray = [];
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    var cursor = db.collection('project').find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function() {
      db.close();
      res.render('index', {elements: resultArray});
    });
  });
});
router.post('/deletee/:pname', function(req, res, next) { 
  var pname = req.params.pname;
  mongo.connect(url, function(err, db) {
      assert.equal(null, err);
      db.collection('project').deleteOne({"pname": pname}, function(err, result) { // tnjm tkoun"_id"
        assert.equal(null, err);
        console.log('Item deleted');
        db.close();
      });
    });
    res.redirect('/');
  });
 

  router.post('/delete', function(req, res, next) {
    var pname = req.body.pname;
  
    mongo.connect(url, function(err, db) {
      assert.equal(null, err);
      db.collection('project').deleteMany({"pname": pname}, function(err, result) {
        assert.equal(null, err);
        console.log('Item deleted');
        db.close();
      });
    });
    res.redirect('/');
  });

module.exports = router;
