'use strict';
const rp = require('request-promise');
const request = require('request');
var Twitter = require('twitter');
const config = require('./config.js');
const T = new Twitter(config);
// let quote = require('./quote.json');//remove delete
const {
    get,
    set
} = require("lodash");

const safeGet = (object, keys, placeholder = '') => get(object, keys) || placeholder;

exports.handler = async (event, context) => {

    try{
        const options = {
            'method': 'GET',
            'url': 'http://quotes.rest/qod',
            'headers': {
            }
          };
        let quote = await rp(options)
        if(typeof quote=="string"){
            quote=JSON.parse(quote);
        }
      
        /** START posting */
        const withAuthor = safeGet(quote,["contents","quotes",0,"quote"])+' - '+safeGet(quote,["contents","quotes",0,"author"])
        // console.log(withAuthor, withAuthor.length)
        if(withAuthor.length<=280){
            if(safeGet(quote,["contents","quotes",0,"background"])){
                // console.log("inif")
                return await postWithImage(
                    safeGet(quote,["contents","quotes",0,"background"]),
                    withAuthor
                )
            }else{
                // console.log("inelse")
                return await postWithoutImage(
                    safeGet(quote,["contents","quotes",0,"quote"])
                )
            }
        }else{
            console.log("more chars can't post")
        }
        
        /** END posting */

        // return true
    }catch (e ) { console.log(e) }
}

const postWithImage = async (imageUrl,text)=>{
    try{
        const media = await uploadMedia(imageUrl)
        const status = {
            status: text,
            media_ids: media.media_id_string // Pass the media id string
        }
        return await uploadStatus(status)
    }catch(e){
        throw e
    }
}

const postWithoutImage = async (text)=>{
    try{
        const status = {
            status: text
        }
        return await uploadStatus(status)
    }catch(e){
        throw e
    }
}

const uploadMedia = (imageUrl)=>{
    return new Promise((resolve, reject) => {
        try{
            let photo = request(imageUrl)
            T.post('media/upload', {media: photo}, function(error, media, response) {
                if (error) {
                    console.log("media_error",error)
                    reject(error);
                }
                else{
                    resolve(media);
                }
            });
        }catch(e){
            throw e
        }
    })
}

const uploadStatus = (status)=>{
    return new Promise((resolve, reject) => {
        try{
            T.post('statuses/update', status, function(error, tweet, response) {
                if (error) {
                    console.log("status_error",error) 
                    reject("finalPosterror");
                }else{
                    resolve("Tweet Done")
                }
            });
        }catch(e){
            throw e
        }
    })
}

/*** remove delete */
// this.handler().then(()=>{
//     console.log("done")
// })