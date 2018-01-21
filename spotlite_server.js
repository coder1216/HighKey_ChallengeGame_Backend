var mysql = require('mysql');

var app, express;

//establish a server, use "express" framework
express = require("express");
var Firebase = require('./challengeNotification')
var firebase = new Firebase();

app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1111",
  database: "SpotLite"
});

con.connect({multipleStatements: true}, function (err) {
  if (err) {
    response.send("you have error");
  }
});

//1. save one user.
app.get("/insertUser", function (request, response) {
  console.log("Connected!");

  userInfo = {"username" : "test4",
    "password" : "password",
    "nickname" : "fuck U",
    "email" : "abc@gmail.com",
    "phone" : "2137161111",
    "score" : "0"};

  var sql = "INSERT IGNORE INTO Users SET ?";
  con.query(sql, userInfo, function (err, result) {
    if (err) {
      response.send(err);
    }
    else{
      console.log("1 record inserted");
      response.send(result);

    }
  });
});

//2. The front end want to get a user information.
app.post("/competitorCandidates", function (request, response) {
  // MongoClient.connect(url, function(err, db) {
  //find people who challenge the given user but haven;t matched yet.
  con.query("SELECT * FROM Challenger WHERE challengee = ? AND date = ? AND isMatched = false", [request.body.challengee, request.body.date], function (err1, result1, fields) {
    if (err1) {
      response.send("you have error");
      return;
    }

    var candidates = [];
    var count = 0;

    var process = function (userName) {
      con.query("SELECT * FROM Challenger WHERE (challengee = ? OR challenger = ?) AND isMatched = true", [userName, userName, request.body.date], function (err2, result2, fields) {

        if (err2) {
          response.send("you have error");
          return;
        }
        if(result2.length == 0){

          con.query("SELECT * FROM Users WhERE username = ?", [userName], function (err3, result3) {
            if (err3) {
              response.send("you have error");
            }
            count += 1;
            candidates.push(result3[0]);
            if (count == arrayLength){
              response.send(candidates);
            }
          });
        }
        else{
          arrayLength -= 1;
          if (count == arrayLength){
            response.send(candidates);
          }
        }
      });
    };

    if(result1.length == 0){
      console.log("this is null");
      response.send(candidates);
      return;
    }
    else{
      var arrayLength = result1.length;
      console.log("find and fetch some items...");
      for (var i = 0; i < result1.length; i++){
        //call a call back nested function
        var userName = result1[i].challenger;
        process(userName);
      }
    }
  });
  // });
});

/*3. When the user picks up a competitor, the system will judege whether it is legal
If the picked person has matched with others, we will forbid this match process and renturn an updated competitor candidate list.
*/
app.post("/getCompetitor", function (request, response) {
  // console.log(request.body);
  con.query("SELECT * FROM Challenger WHERE (challenger = ? OR challengee = ?) AND date = ? AND isMatched = true", [request.body.challenger, request.body.challenger, request.body.date], function (err, result, fields) {

    if (err) {
      response.send("you have error");
      return;
    }
    if(result.length == 0){
      // response.send(["true"]);
      con.query("SELECT * FROM Users WHERE username = ?", [request.body.challenger], function (err,result,field) {
        if (err) {
          response.send("you have error");
        }
        else{
          response.send(result);
        }
      });


      con.query("UPDATE Challenger SET isMatched = true WHERE challenger = ? AND challengee = ? AND date = ?", [request.body.challenger, request.body.challengee, request.body.date], function(err, result, fileds){
        if (err) {
          response.send("you have error");
        }
      else{
          console.log("updated");
        }
      });
    }
    else{
      //The candidate cannot be either a challenger or challengee in any row.
      con.query("SELECT * FROM Challenger WHERE challengee = ? AND date = ? AND isMatched = false", [request.body.challengee, request.body.date], function (err1, result1, fields) {
        if (err1) {
          response.send("you have error");
          return;
        }

        var candidates = [];
        var count = 0;

        var process = function (userName) {
          con.query("SELECT * FROM Challenger WHERE (challengee = ? OR challenger = ?) AND isMatched = true", [userName, userName, request.body.date], function (err2, result2, fields) {

            if (err2) {
              response.send("you have error");
              return;
            }
            if(result2.length == 0){

              con.query("SELECT * FROM Users WhERE username = ?", [userName], function (err3, result3) {
                if (err3) {
                  response.send("you have error");
                }
                count += 1;
                candidates.push(result3[0]);
                if (count == arrayLength){
                  console.log(candidates);
                  response.send(candidates);
                }
              });
            }
            else
              arrayLength -= 1;


          });
        };

        if(result1.length == 0){
          console.log("this is null");
          response.send(candidates);
          return;
        }
        else{
          var arrayLength = result1.length;
          console.log("find and fetch some items...");
          for (var i = 0; i < result1.length; i++){
            //call a call back nested function
            var userName = result1[i].challenger;
            process(userName);
          }
        }
      });
    }
  });
});

//4. The front end want to get a user information.
app.post("/getUser", function (request, response) {
  con.query("SELECT * FROM users WHERE username = '" + "test1" + "'", function (err, result, fields) {
    if (err) {
      response.send("you have error");
      return;
    }
    console.log("get one user");
    response.send(result);
  });
});

//5. get daily challenge.
app.post("/getChallenge", function (request, response) {
  con.query("SELECT * FROM Challenge WHERE date = ?", request.body.date, function (err, result, fields) {
    if (err) {
      response.send("you have error");
      return;
    }

    response.send(result[0]);
  });
});

//6. get upcoming challenges.
app.post("/getUpcomingChallenges", function (request, response) {
  console.log("get upcoming challenges")
  var dates = ["10-21-2017", "10-22-2017", "10-23-2017", "10-24-2017"];

  //build the query
  var query = "SELECT * FROM Challenge WHERE (date = \'\'";
  for (var i = 0; i < dates.length; i++){
    query += " OR date = '" + dates[i] + "'";
  }
  query += ")";

  con.query(query, function (err, result, fields) {
    if (err) {
      response.send("you have error");
      return;
    }
    response.send(result);
  });
});

//7. Check whether this user is approved for today's challenge
app.post("/approved", function (request, response) {
  console.log("check approve");
  var myobj = {date: request.body.date, username: request.body.username};
  con.query("SELECT * FROM Verified WHERE date = ? AND username = ?", [request.body.date, request.body.username], function (err, result, field) {
    if (err) {
      response.send("you have error");
      return;
    }
    response.send(result);
  });
});

//8. Submit challenge idea
app.post("/submitIdea", function (request, response) {
  console.log("Submit a suggestion");
  var myobj = {date: request.body.date, description: request.body.description, challengeName: request.body.challengeName, img: request.body.img};
  con.query("INSERT IGNORE INTO Suggestions SET ?", myobj, function (err, result, field) {
    if (err) {
      response.send("you have error");
      return;
    }
    console.log("Insert 1 element correctly");
    response.send(["true"]);
  });
});

//9. add post
app.post("/addPost", function (request, response) {
  console.log("add post");

  console.log(request.body);
  // response.send(request.body);

  var myobj = {username : request.body.username, img: request.body.img, date: request.body.date, isChallenge: request.body.isChallenge, time : request.body.time};

  con.query("Insert Into Posts SET ?", myobj, function (err, result, field) {
    if (err) {
      response.send("you have error");
      return;
    }

    console.log("---");
    // response.send(["true"]);
  });
});

//1o. Use a table to store all the phone numbers that a given user challenged today.
app.post("/challengedPhone", function (request, response) {
  console.log("insert challengedPhone");
  var phones = request.body.phones;
  for (var i = 0; i < phones.length; i++){
    var myobj = {username : request.body.username, phone: phones[i], date: request.body.date};
    con.query("INSERT IGNORE INTO ChallengedPhone SET ?", myobj, function(err, res, field) {
      if (err) {
        response.send("you have error");
        return;
      }
      console.log("Insert 1 element correctly");
    });
  }
  response.send(["true"]);
});

//11. Challenge others
app.post("/challengeOthers", function (request, response) {
  console.log("Challenge others");
  var challengees = request.body.challengees;
  var phones = request.body.phones;

  for (var i = 0; i < phones.length; i++){
    var myobj = {username : request.body.username, phone: phones[i], date: request.body.date};
    con.query("INSERT IGNORE INTO ChallengedPhone SET ?", myobj, function(err, res, field) {
      if (err) {
        // response.send("you have error");
        return;
      }

      console.log("Insert 1 element correctly");
    });
    myobj = {isMatched: false, challenger: request.body.username, challengee: challengees[i], date: request.body.date};
    con.query("INSERT IGNORE INTO Challenger SET ?", myobj, function (err, res, field) {
      if(err){
        // response.send(err);
        return;
      };

      console.log("Add one more challenger Pair");
    });
  }

  response.send(["true"]);
});

//12. Check whether the user is matched or not before rendering the challenge screen
app.post("/isMatched", function (request, response) {
  console.log("Judge the given user status");
  con.query("SELECT * FROM Challenger WHERE (Challengee = ? OR Challenger = ?) AND isMatched = true AND date = ?", [request.body.username, request.body.username, request.body.date], function (error, result, field) {
    if (error) {
      response.send("you have error");
      return;
    }

    if (result.length == 0)
      response.send(result);
    else{

      var peers = [];
      var temp = result[0];
      con.query("SELECT * FROM Users WHERE (username = ? OR username = ?)", [temp.challengee, temp.challenger], function (errorDash, resultDash, fieldDash) {
        if (errorDash) {
          response.send("you have error");
          return;
        }
        // console.log( " The matched result is " + resultDash);
        response.send(resultDash);
      });
    }
  });
});

//13. Get the challenged-related image/video that the given user sent
app.post("/getImage", function (request, response) {
  console.log("Get the user's post");
  con.query("SELECT * FROM Posts WHERE username = ? AND date = ? AND isChallenge = ?", [request.body.username, request.body.date, "true"], function (error, result, field) {

    if (error) {
      response.send(error);
      return;
    }

    response.send(result);

  });
});

//14. Get the challenged-related image/video that the given user sent
app.post("/verify", function (request, response) {
  console.log("Verify the user's post ");
  var myObj = {username : request.body.username, date : request.body.date, isApproved : request.body.isApproved};
  con.query("INSERT INTO Verified SET ?", myObj, function (error, result, field) {
    if (error) {
      response.send("you have error");
      return;
    }

    response.send(result);

  });
});

//15. Get the number of phone numbers the given user has challenged
app.post("/inviteNumber", function (request, response) {
  console.log("Get the No. of phone No.s the user challenged");
  var username = request.body.username;
  var date = request.body.date;
  con.query("SELECT * FROM ChallengedPhone WHERE username = ? AND date = ?", [username, date], function (error, result, field) {

    if (error) {
      response.send("you have error");
      return;
    }

    response.send([result.length]);

  });
});

//16. Get the sorted array of users which are ordered by their scores in descending order.
app.post("/getRank", function (request, response) {
  console.log("Get the rank list");
  // console.log("date is = " + request.date);

  con.query("SELECT * FROM Scores WHERE date = ? ORDER BY score DESC", [request.body.date], function (error, result) {
    if (error) {
      response.send("you have error");
      return;
    };

    response.send(result);
  })
});

//17. send notification to users
app.post("/sendNotification", function (request, response) {
  console.log("send notification to other users");

  var count = 0;

  var addToNotificaitonGroup =  function (username) {
    con.query("SELECT * FROM Users WHERE `username` = ?", [username], function (error, result, field) {
      if(error){
        response.send(error);
        return;
      }
      else{
        console.log(result[0]);
        var registrationToken = result[0].firebaseToken;

        var group = "NotificationGroup";
        var content = request.body.description;

        firebase.sendSingleMessage(registrationToken,content);
        // firebase.addUserToGroup("dT0fq7xl9sY:APA91bGj7Q-bWRw80tx_-wCd6Dvwfw5SmDdsbi6qVffoIDvyZZHnjA292mc4nWhD8rU6oU6P7w4zdMwgl97Lt_Sco7mTbUKiVPafF5GUt9PcxY_9gLfEc2jiUkxRA-0lA0ZP_o17JNxw",group);
        // firebase.addUserToGroup("ebV1KBaNqfc:APA91bFYLB0r3YStmIU4uMToOCW-sXmJuSIMr2DT6tRuyCjwE340GnAm_7v-T_gPHxDdmZ57Zr0bID-zeqSJ2wmuMquQduqt11DVXUcMAgs63ZfhRb36L-1rwOv2orpshyeS2krgn-tU",group);
        // firebase.addUserToGroup("dVDGW1dLhMY:APA91bGRNlSV_5E4MLtu9Ia9PjzmAY-6_Z4MM6xKVRVFJpiE-Adm-bpkTiNq5MFA3EBHMuRyfTOYNIXQSKsZLSpzeN8oajvsHBR52AsYoeBuHpGFI5n_WIB1u7ZjVsICT8IBG9WGj19d",group);
        // firebase.removeUserToGroup(registrationToken,topic);
        // firebase.sendGroupMessage(group,content);
      }

      if(count == request.body.username.length)
        response.send(["true"]);

    });
  }

  for(var i = 0; i < request.body.username.length; i++){
    addToNotificaitonGroup(request.body.username[i]);
  }
});

//18. update the given user's today score
app.post("/updateScore", function (request, response) {
  console.log("update user's today score");

  con.query("SELECT * FROM Scores WHERE (username = ? AND date = ?)", [request.body.username, request.body.date], function (error, result) {
    if(error){
      response.send(error);
      return;
    }

    con.query("UPDATE Scores SET score = ? WHERE username = ?", [result[0].score + request.body.score, request.body.username], function (err, result) {
      if(err){
        response.send(err);
        return;
      };

      response.send(["true"]);
    })
  });
});








app.get("/newDayUpdate", function (request, response) {
  console.log("Welcome to a new day!");

  con.query("SELECT * FROM Users", function (err, result) {
    if(err){
      response.send(err);
      return;
    };

    for(var i = 0; i < result.length; i++){
      var today = new Date();
      var myObj = {
        username: result[i].username,
        nickname: result[i].nickname,
        date: (today.getMonth() + 1) + "-" + (today.getDate()) + "-" + (today.getFullYear()),
        score: 0
      };
      con.query("INSERT IGNORE INTO Scores SET ?", myObj);
    };
    response.send(["true"]);
  });
});

app.get("/reset", function(request, response) {
  console.log("reset");

  con.query("DELETE FROM Challenger;", function (err, result) {
    if(err){
      response.send(err);
      return;
    }
    con.query("DELETE FROM Posts;", function (err, result) {
      if(err){
        response.send(err);
        return;
      }
      con.query("DELETE FROM Posts;", function (err, result) {
        if(err){
          response.send(err);
          return;
        }
        con.query("DELETE FROM ChallengedPhone;", function (err, result) {
          if(err){
            response.send(err);
            return;
          }
          con.query("DELETE FROM Verified;", function (err, result) {
            if(err){
              response.send(err);
              return;
            }
            response.send("true");
          });
        });
      });
    });
  });
});

//create a table
function createTable(){
  con.connect(function(err) {
    if (err) {
      response.send("you have error");
      return;
    }
    console.log("Connected!");
    con.query("CREATE DATABASE SpotLite", function (err, result) {
      if (err) {
        response.send("you have error");
      }
      console.log("Database created");
    });
  });
}

//start to listen port 8888
app.listen(8888);