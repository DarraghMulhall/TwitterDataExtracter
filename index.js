var CONFIG = require('./config.json');

var Twitter = require('twitter');
var https = require('https');
var http = require('http')
var mysql = require('mysql');


var username = ''
var scores = {}

var fs = require('fs')



http.createServer(function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Hello World!');
        console.log(req.method)
        if (req.method == 'POST') {
                console.log("POST it is");
//      process.exit()
        var body = '';
        req.on('data', function (data) {
            body += data;
            console.log("Partial body: " + body);
        });
        req.on('end', function () {
           var userScores = JSON.parse(body);
        res.end()
           scores = userScores["scores"]
           main()
        });
    }
  res.end();
}).listen(3000);



function checkAndHandleForExistingUser(){
        var userExists = false
        var con = mysql.createConnection({
        host: "twitter-database.ci3cppc9rrzd.eu-west-2.rds.amazonaws.com",
        user: "DarraghMulhall",
        password: "daramul96",
        database: "TwitterUserData"
      });

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");

        //if user already exists in database, delete their scores entry for new one and insert current given scores
        var userCheckSql = "SELECT * FROM user_data WHERE username = '"+username+"'"
        con.query(userCheckSql, function (err, result) {
            if (err) throw err;
            if(result.length!=0){
                userExists = true
                console.log("shud delete")
                var deleteUserScores = "DELETE FROM big_five_scores WHERE username = '"+username+"'"

                con.query(deleteUserScores, function (err, result) {
                    if (err) throw err;
                 //   con.end()
                });
                }
                var insertScoresSql = "INSERT INTO big_five_scores (username, ext, neu, agr, con, opn) VALUES "
                        +"('"+username+"', "+scores["ext"]+", "+scores["neu"]+", "+scores["agr"]+", "+scores["con"]+", "+scores["opn"]+")"

                 con.query(insertScoresSql, function (err, result) {
                    if (err) throw err;
                 con.end()
                });

        });
        });
        return userExists
}


function getTwitterInfo(){
    var OAuth2 = require('oauth').OAuth2;

    var oauth2 = new OAuth2(CONFIG.key, CONFIG.secret, 'https://api.twitter.com/', null, 'oauth2/token', null);
    oauth2.getOAuthAccessToken('', {
        'grant_type': 'client_credentials'
    }, function (e, access_token) {
        console.log(access_token); //string that we can use to authenticate request

        var options = {
            hostname: 'api.twitter.com',
            path: '/1.1/statuses/user_timeline.json?screen_name=+'+username+'&count=200&tweet_mode=extended&page=1',
            headers: {
                Authorization: 'Bearer ' + access_token
            }
        };

        var total_statuses = 0
        https.get(options, function (result) {
            var buffer = '';
            result.setEncoding('utf8');
            result.on('data', function (data) {
                buffer += data;
            });
            result.on('end', function () {
                var tweets = JSON.parse(buffer);

                if(tweets.length == null){
                    console.log("Invalid username")
                }
                else {
                    if(tweets.length > 0)
                    total_statuses = tweets[0]['user']['statuses_count']

                    var iterations =Math.ceil((total_statuses)/200)

                    if(iterations > 16){
                        iterations = 16
                    }
                    var iteration = 2
                    getPageOfTweets(tweets, iteration, iterations, access_token)
                }

            });
        });
    });
}


function getPostsByUser(tweets){
    var posts = ""
    var count = 0
    for(var i=0; i<tweets.length; i++){
        if(tweets[i]["full_text"].charAt(0) != '@' && tweets[i]["full_text"].substring(0, 2) != 'RT'){
            posts += tweets[i]["full_text"]
            count++
        }
    }
    var posts_obj = {
        'posts' : posts,
        'count' : count
    }
    return posts_obj
}


function getRepliesFromUser(tweets){
    var replies = ""
    var count = 0
    for(var i=0; i<tweets.length; i++){
        if(tweets[i]["full_text"].charAt(0) == '@'){
            replies += tweets[i]["full_text"]
            count++
        }
    }
    var replies_obj = {
        'replies' : replies,
        'count' : count
    }
    return replies_obj
}

function total_retweet_count(tweets){
    var total_retweet_count = 0
    for(var i=0; i<tweets.length; i++){
        if(tweets[i]["full_text"].substring(0, 2) != 'RT')
        total_retweet_count += tweets[i]["retweet_count"]
    }
    return total_retweet_count
}


function total_favourite_count(tweets){
    var total_favourite_count = 0

    for(var i=0; i<tweets.length; i++){
        total_favourite_count += tweets[i]["favorite_count"]
    }
    return total_favourite_count
}

function hashtagsPerTweet(tweets){
    var total_hashtags = 0
    for(var i=0; i<tweets.length; i++){
       total_hashtags += tweets[i]["entities"]["hashtags"].length
    }
    console.log(total_hashtags)
    return total_hashtags/tweets.length
}


function urlsPerTweet(tweets){
    var total_urls = 0
    for(var i=0; i<tweets.length; i++){
        total_urls += tweets[i]["entities"]["urls"].length
    }
    console.log(total_urls)
    return total_urls/tweets.length
}


function mentionsPerTweet(tweets){
    var total_mentions = 0
    for(var i=0; i<tweets.length; i++){
        total_mentions += tweets[i]["entities"]["user_mentions"].length
    }
    return total_mentions/tweets.length
}

function calcAveragePostLength(tweets, posts_count){
    var average_length = 0.0
    for(var i=0; i<tweets.length; i++){
        if(tweets[i]["full_text"].charAt(0) != '@' && tweets[i]["full_text"].substring(0, 2) != 'RT'){
            average_length += tweets[i]["full_text"].length
        }
    }

    return average_length/posts_count
}


function calcAverageReplyLength(tweets, replies_count){
    var average_length = 0.0
    for(var i=0; i<tweets.length; i++){
        if(tweets[i]["full_text"].charAt(0) == '@'){
            average_length += tweets[i]["full_text"].length
        }
    }
    return average_length/replies_count
}




function insertDataToDatabase(tweets){
    //console.log(tweets)
    var posts_obj = getPostsByUser(tweets)
    var replies_obj = getRepliesFromUser(tweets)
    var total_statuses = tweets[0]["user"]["statuses_count"]

    var posts = posts_obj["posts"]
    var posts_count = posts_obj["count"]

    var replies = replies_obj["replies"]
    var replies_count = replies_obj["count"]

    var retweets_count = total_statuses - posts_count - replies_count

    var listed_count = tweets[0]["user"]["listed_count"]

    var favourites_count = tweets[0]["user"]["favourites_count"]

    var following_count = tweets[0]["user"]["friends_count"]

    var followers_count = tweets[0]["user"]["followers_count"]

    var description_length = tweets[0]["user"]["description"].length
    var description =  tweets[0]["user"]["description"]

    var retweet_count = total_retweet_count(tweets)
    var favourite_count = total_favourite_count(tweets)

    var averageHashtagNumPerTweet = hashtagsPerTweet(tweets)

    var averageUrlNumPerTweet = urlsPerTweet(tweets)

    var wordsPerTweet = posts_obj["posts"].split(" ").length/posts_count

    var wordsPerReply = replies_obj["replies"].split(" ").length/replies_count

    var averageMentionsPerTweet = mentionsPerTweet(tweets)

    var linguistic_data = posts + " " + replies + " " + description

    var averagePostLength = calcAveragePostLength(tweets, posts_count)
    var averageReplyLength = calcAverageReplyLength(tweets, replies_count)

    var con = mysql.createConnection({
        host: "twitter-database.ci3cppc9rrzd.eu-west-2.rds.amazonaws.com",
        user: "DarraghMulhall",
        password: "daramul96",
        database: "TwitterUserData"
      });

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");

                        var user_data_sql = "INSERT INTO user_data (username, total_status_count, posts_count, replies_count, retweets_count, listed_count"+
                ", favourites_count, following_count, followers_count, desc_length, tweets_retweeted_count, tweets_favourited_count, hashtags_per_tweet"+
                ", urls_per_tweet, mentions_per_tweet, words_per_tweet, words_per_reply, average_post_length, average_reply_length) VALUES ('"+username+"', "+total_statuses+", "+posts_count+", "+replies_count+", "+retweets_count+
                ", "+listed_count+", "+favourites_count+", "+following_count+", "+followers_count+", "+description_length+", "+retweets_count+", "+favourite_count+", "+averageHashtagNumPerTweet+
                ", "+averageUrlNumPerTweet+", "+averageMentionsPerTweet+", "+wordsPerTweet+", "+wordsPerReply+", "+averagePostLength+", "+averageReplyLength+")";

                con.query(user_data_sql, function (err, result) {
                    if (err) throw err;
                    console.log("1 record inserted");
                    con.end()
                });
        });
}


function getPageOfTweets(concat_tweets, iteration, maxIterations, access_token){

    //when all async requests are done - begin process to insert user's data to database
    console.log(iteration+" "+maxIterations)
    if(iteration > maxIterations){
        insertDataToDatabase(concat_tweets)
    }
    else {
        var options = {
        hostname: 'api.twitter.com',
        path: '/1.1/statuses/user_timeline.json?screen_name='+username+'&count=200&tweet_mode=extended&include_rts=true&exclude_replies=false&page='+iteration,
        headers: {
            Authorization: 'Bearer ' + access_token
        }
    };

    https.get(options, function (result) {
            var buffer = '';
            result.setEncoding('utf8');
            result.on('data', function (data) {
                buffer += data;
            });
            result.on('end', function () {
            var tweets = JSON.parse(buffer);
            //console.log(tweets)
            concat_tweets = concat_tweets.concat(tweets)
            getPageOfTweets(concat_tweets, iteration+1, maxIterations, access_token)
            });
        });
    }

}

function main(){
        var userExists = checkAndHandleForExistingUser()
        if(!userExists)
                getTwitterInfo()
}


//getTwitterInfo()