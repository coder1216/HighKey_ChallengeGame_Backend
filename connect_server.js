var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/spotlite";


var app, express;

//establish a server
express = require("express");

app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


//1. save one user.
// app.post("/insertUser", function (request, response) {
//     var result = insertItem(request.body.username, request.body.password, request.body.nickname, request.body.email, request.body.phone, request.body.score);
//     response.send(result);
// });

//2. The front end want to get a user information.
app.post("/competitorCandidates", function (request, response) {

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("Challenger").find({challengee : request.body.challengee, date : request.body.date, isMatched : false}).toArray(function(err, result) {
            // console.log("shiji hello");
            if (err) throw err;
            if(result.length == 0){
                console.log("this is null");
                response.send(result);
            }
            else{
                console.log("find and fetch some items...");
                var arrayName = [];
                for (var i = 0; i < result.length; i++){
                    arrayName[i] = result[i].username;
                }
                // response.send(arrayName);
                var myobj = {username :{$in: arrayName}};
                db.collection("users").find(myobj).toArray(function(err1, result1) {
                    if (err1) throw err1;
                    db.close();

                    response.send(result1);
                });
            }
        });
    });
});

//3. Check whether the competitor selected by the user is matched or not.
/*
If not, return an empty array,
If yes, return an array of candidates.
 */
app.post("/getCompetitor", function (request, response) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("Challenger").findOne({username : request.body.challenger, date : "10-20-2017", isMatched : true}, function(err, result) {
            // console.log(request.body.username);
            if (err) throw err;
            if(result == null){
                response.send(["true"]);
            }
            else{
                //The candidate cannot be either a challenger or challengee in any row.
                db.collection("Challenger").find({challengee : "test2", date: "10-20-2017", isMatched : false}).toArray(function(err1, result1) {
                    if (err1) throw err1;

                    var candidates = [];
                    var count = 0;

                    var process = function (userName) {
                        db.collection("Challenger").findOne({$or: [{challengee: userName, isMatched: true, date: "10-20-2017"}, {username: userName, isMatched: true, date: "10-20-2017"}]}, function(err2, result2) {

                            if (err2) throw err2;

                            if(result2 == null){

                                db.collection("users").findOne({username: userName}, function(err3, result3) {
                                    if (err3) throw err3;
                                    count += 1;
                                    candidates.push(result3);

                                    if (count == arrayLength){
                                        response.send(candidates);
                                    }
                                });
                            }
                            else
                                arrayLength -= 1;


                        });
                    }

                    if(result1.length == 0){
                        console.log("this is null");
                        db.close();
                    }
                    else{
                        var arrayLength = result1.length;
                        console.log("find and fetch some items...");
                        for (var i = 0; i < result1.length; i++){
                            //call a call back nested function
                            var userName = result1[i].username;
                            process(userName);
                        }
                    }
                });
            }
        });
    });
});

//4. The front end want to get a user information.
app.post("/getUser", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {username : "test1"};
        db.collection("users").findOne(myobj, function(err, result) {
            if (err) throw err;
            console.log(result);
            console.log("get one user");
            db.close();
            response.send(result);
        });
    });
});

//5. get daily challenge.
app.post("/getChallenge", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        console.log("Welcome Lin");
        if (err) throw err;
        var myobj = {date : request.body.date};
        console.log("Welcome Lin");
        db.collection("Challenge").findOne(myobj, function(err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
            response.send(result);
        });
    });
});

//6. get upcoming challenges.
app.post("/getUpcomingChallenges", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {date: {$in: ["10-20-2017", "10-21-2017", "10-22-2017", "10-23-2017"]}};
        db.collection("Challenge").find(myobj).toArray(function(err, result) {
            if (err) throw err;

            db.close();
            response.send(result);
        });
    });
});

//7. Check whether this user is approved for today's challenge
app.post("/approved", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {date: response.body.date, username: request.body.username};
        db.collection("Approved").find(myobj).toArray(function(err, result) {
            if (err) throw err;
            db.close();
            response.send(result);
        });
    });
});

//8. Submit challenge idea
app.post("/submitIdea", function (request, response) {
    console.log("Submit suggestion");
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {date: request.body.date, description: request.body.description, challengeName: request.body.challengeName, img: request.body.img};
        db.collection("Suggestions").insertOne(myobj, function(err,res) {
            if (err) throw err;
            console.log("Insert 1 element correctly");
            db.close();
            return "stored";
        });
    });
});

//9. add post
app.post("/addPost", function (request, response) {
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var myobj = {username : request.body.username, post: request.body.image, date: request.body.date, isChallenge: request.body.isChallenge};
        db.collection("Posts").insertOne(myobj, function(err,res) {
            if (err) throw err;
            console.log("Insert 1 element correctly");
            db.close();
            return "stored";
        });
    });
});

//1o. Interact with phone numbers that a user have challenged already.
app.get("/challengedPhone", function (request, response) {
    console.log("insert challengedPhone");
    MongoClient.connect(url, function(err,db) {
        if (err) throw err;
        var phones = ["123123", "456456", '789789', '000000'];
        for (var i = 0; i < phones.length; i++){
            var myobj = {username : "test2", phone: phones[i], date: "10-20-2010"};
            db.collection("ChallengedPhone").insertOne(myobj, function(err,res) {
                if (err) throw err;
                console.log("Insert 1 element correctly");
                db.close();
                console.log("stored");
            });
        }
        response.send("succeed");
    });
});

//start to listen port 8888
app.listen(8888);


//create a collection/another word for table
function createCollection(TableName){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.createCollection(TableName, function(err, res) {
        if (err) throw err;
        console.log("create a table called " + TableName);
        db.close();
      });
    });
}

//Insert one attribute to a collection
function insertItem(username, password, nickname, email, phone, score){
    MongoClient.connect(url, function(err,db) {
       if (err) throw err;
        var myobj = {username : username, password: password, nickname : nickname, email : email, phone : phone, score: score};
        db.collection("users").insertOne(myobj, function(err,res) {
            if (err) throw err;
            console.log("Insert 1 element correctly");
            db.close();
            return res;
        });
    });
}

//find one attribute from a collection
function findItem(username){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("users").findOne({username : username}, function(err, result) {
        if (err) throw err;
        if(result == null){
            console.log("this is null");
        }
        db.close();
      });
    });
}

//find all records that satisfy our search query.
function findChallengers(username){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("Challenger").find({username : username}, function(err, result) {
            if (err) throw err;
            if(result == null){
                console.log("this is null");
            }
            else{
                console.log("find and fetch some items...");
            }
            db.close();
            return result;
        });
    });
}

//search the required elements
function search(name){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var query = {name : name};
        db.collection("users").find(query).toArray(function(err, result) {
           if (err) throw err;
            console.log(result);
            db.close();
        });
    });
}
