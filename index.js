
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
// var client = new Twitter({
//   consumer_key: CONFIG.key,
//   consumer_secret: CONFIG.secret,
//   access_token_key: '965933510660849669-UMh6KhZWUIb0P0AFYZLBma2UA4qY42T',
//   access_token_secret: 'VajliFdcDFkXKaxCrXadPV7gwjIWZOGNssBwwNb8wA38d'
// });
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream('./debug.log', {flags : 'w'});
var log_stdout = process.stdout;

// console.log = function(d) { //
//   log_file.write(util.format(d) + '\n');
//   log_stdout.write(util.format(d) + '\n');
// };

// var params = {screen_name: 'notskend', count: 200};
// client.get('statuses/user_timeline', params, function(error, tweets, response) {
//   if (!error) {
//     console.log(tweets);
//   }
// });

// var options = {
//     hostname: 'westus.api.cognitive.microsoft.com',
//     path: '/emotion/v1.0/recognize?',
//     headers: {
//         'Content-Type': 'application/json',
//         'Ocp-Apim-Subscription-Key' : 'bf06182c16a84d55b3a00fea0e32bab7'
//     },
//     method: 'POST',
//     data: '{"url": "http://www.classycareergirl.com/2016/03/happy-people-easy-habits/"}',
// };


// http.request(options, function (result) {
//     result.on('data', function (data) {
//             var obj = JSON.parse(data)
//             console.log(obj)
//     });
//     result.on('end', function (data) {

//     });
// });

var options = {
    hostname: 'api.dandelion.eu',
    path: '/datatxt/sent/v1&token=fe32f55985e3448389475657a2d14c90&url=https://www.theregister.co.uk/2018/02/22/tim_chevalier_vs_google/',
    headers: {
        'Content-Type': 'application/json',
    }
    
    //token : 'fe32f55985e3448389475657a2d14c90',

   // 'url': "https://www.theregister.co.uk/2018/02/22/tim_chevalier_vs_google/"
};


https.get(options, function (result) {
    result.on('data', function (data) {
        console.log(JSON.stringify(data))
    });
    result.on('end', function (data) {
        
    });
});






// var OAuth2 = require('oauth').OAuth2;

// var count = 0

// var oauth2 = new OAuth2(CONFIG.key, CONFIG.secret, 'https://api.twitter.com/', null, 'oauth2/token', null);
// oauth2.getOAuthAccessToken('', {
//     'grant_type': 'client_credentials'
// }, function (e, access_token) {
//     console.log(access_token); //string that we can use to authenticate request
    

//     var total_statuses = 0
//     https.get(options, function (result) {
//         var buffer = '';
//         result.setEncoding('utf8');
//         count++
//         var text_arr = []
//         result.on('data', function (data) {
//           //console.log(data + "\n\n")
//           // var jsonData = JSON.parse(data)
//           // console.log(jsonData)
//           // console.log("\n\n========\n\n")
//           //   text_arr.push(jsonData["full_text"])
//             buffer += data;
//             //var obj_arr = JSON.parse(data)
//             //console.log(j)
//             //var last_id = j[0]
           
            
            
//         });
//         result.on('end', function () {
//           //console.log(text_arr)
//             var tweets = JSON.parse(buffer);
//             console.log(tweets)
//             console.log(tweets.length)
//             for(var j=0; j<tweets.length; j++){
//                 //console.log(tweets[j]['full_text'] + " " + tweets[j]['created_at'] + "\n")
//             }
//             if(tweets.length > 0)
//                 total_statuses = tweets[0]['user']['statuses_count']

//             var iterationsLeft =(total_statuses)/200 + 1
//             // console.log(tweets)
//             getMoreTweets(iterationsLeft)
//         });
//     });

    
//     function getMoreTweets(iterationsLeft){
//         var tweets_arr = []
//         for(var i=2; i<iterationsLeft; i++){
//             var options = {
//                 hostname: 'api.twitter.com',
//                 path: '/1.1/statuses/user_timeline.json?screen_name=notskend&count=200&tweet_mode=extended&include_rts=false&exclude_replies=true&page='+i,
//                 headers: {
//                     Authorization: 'Bearer ' + access_token
//                 }
//             };
    
    
//             https.get(options, function (result) {
//                 var buffer = '';
//                 result.setEncoding('utf8');
//                 result.on('data', function (data) {
//                     buffer += data;
//                 });
//                 result.on('end', function () {
//                   //console.log(text_arr)
//                     var tweets = JSON.parse(buffer);
//                     //console.log(tweets)
//                     for(var j=0; j<tweets.length; j++){
//                         tweets_arr.push(tweets[j]['full_text'])
//                         //console.log(tweets[j]['full_text'] + " created: " + tweets[j]['created_at'] + "\n")
//                     }
//                 });
//             });
    
            
//         }
//     }

    

    



    
// });