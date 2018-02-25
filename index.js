
// tweets (replies + posts) - linguistic analysis
// num replies
// num posts

// listCount

//followers_count
//friends_count (following)

//description - linguistic analysis

//favourites_count (number user has liked)




 var CONFIG = require('./config.json');

var Twitter = require('twitter');
var https = require('https');
var http = require('http')
var mysql = require('mysql');




function getTwitterInfo(){
    var OAuth2 = require('oauth').OAuth2;

    var oauth2 = new OAuth2(CONFIG.key, CONFIG.secret, 'https://api.twitter.com/', null, 'oauth2/token', null);
    oauth2.getOAuthAccessToken('', {
        'grant_type': 'client_credentials'
    }, function (e, access_token) {
        console.log(access_token); //string that we can use to authenticate request
        
        var options = {
            hostname: 'api.twitter.com',
            path: '/1.1/statuses/user_timeline.json?screen_name=notskend&count=200&tweet_mode=extended&page=1',
            headers: {
                Authorization: 'Bearer ' + access_token
            }
        };

        var total_statuses = 0
        https.get(options, function (result) {
            var buffer = '';
            result.setEncoding('utf8');
            var text_arr = []
            result.on('data', function (data) {
                buffer += data;
            });
            result.on('end', async function () {
              //console.log(text_arr)
                var tweets = JSON.parse(buffer);
                //console.log(tweets.length)
                for(var j=0; j<tweets.length; j++){
                    //console.log(tweets[j]['full_text'] + " " + tweets[j]['created_at'] + "\n")
                }
                if(tweets.length > 0)
                    total_statuses = tweets[0]['user']['statuses_count']

                var iterationsLeft =(total_statuses)/200 + 1
                //console.log(iterationsLeft)
                var iteration = 2
                getPageOfTweets(tweets, iteration, iterationsLeft, access_token)
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

    var wordsPerReplies = replies_obj["replies"].split(" ").length/replies_count

    var averageMentionsPerTweet = mentionsPerTweet(tweets)

    var linguistic_data = posts + " " + replies + " " + description
    
    // var con = mysql.createConnection({
    //     host: "localhost",
    //     user: "yourusername",
    //     password: "yourpassword",
    //     database: "mydb"
    //   });

    // con.connect(function(err) {
    //     if (err) throw err;
    //     console.log("Connected!");
        var sql = "INSERT INTO twitter_users (tweets, total_status_count, posts_count, replies_count, retweets_count, listed_count"+
        ",favourites_count, following_count, followers_count, desc_length, tweets_retweeted_count, tweets_favourited_count, hashtags_per_tweet"+
        ", urlsPerTweet, mentions_per_tweet, words_per_tweet, words_per_replies) VALUES ("+linguistic_data+", "+total_statuses+", "+posts_count+", "+replies_count+", "+retweets_count+
        ", "+listed_count+", "+favourites_count+", "+following_count+", "+followers_count+", "+description_length+", "+retweets_count+", "+favourite_count+", "+averageHashtagNumPerTweet+
        ", "+averageUrlNumPerTweet+", "+averageMentionsPerTweet+", "+wordsPerTweet+", "+wordsPerReplies+")";
        console.log(sql)
        // con.query(sql, function (err, result) {
        //     if (err) throw err;
        //     console.log("1 record inserted");
        // });
    //});


}


function getPageOfTweets(concat_tweets, iteration, maxIterations, access_token){

    //when all async requests are done - begin process to insert user's data to database
    if(iteration > maxIterations){
        insertDataToDatabase(concat_tweets)
    }
    else {
        var options = {
        hostname: 'api.twitter.com',
        path: '/1.1/statuses/user_timeline.json?screen_name=notskend&count=200&tweet_mode=extended&include_rts=true&exclude_replies=false&page='+iteration,
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
            console.log("async")
            concat_tweets = concat_tweets.concat(tweets)
            getPageOfTweets(concat_tweets, iteration+1, maxIterations, access_token)
            });
        });
    }
    
}




getTwitterInfo()