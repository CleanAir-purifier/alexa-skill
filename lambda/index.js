/*
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

// sets up dependencies
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const http = require('http');
const fetch = require('node-fetch');
const languageStrings = require('./languageStrings');

/*
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
     
        var frase = 'Olá, eu sou CleanAir';
        
        const speakOutput = frase;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
*/

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    console.log('Inside LaunchRequestHandler');
    return handlerInput.responseBuilder
      .speak('Bem vindo a Clean Air?')
      .reprompt('O que deseja?')
      .getResponse();
  },
};

const GetPurifierHandler = {
  canHandle(handlerInput) {
      
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetPurifierIntent');
  },
  handle(handlerInput) {
        const theNumber = handlerInput.requestEnvelope.request.intent.slots.id.value;
        const URL = 'https://clean-air-api.herokuapp.com/purifier/';
        var speakOutput = theNumber ;
       
        return new Promise((resolve, reject) => {
            getHttp(URL, theNumber).then(response => {
                const responseJSON = JSON.parse(response);
                const responseBattery = responseJSON["battery"];
                speakOutput += " A bateria do purificador está em " + responseBattery + "por cento.";
                
                const responseFilter = responseJSON["filter_status"];
                speakOutput += " O filtro está " + responseFilter;
                
                const responseLight = responseJSON["light_status"];
                speakOutput += " A luz está  " + responseLight;
                
                resolve(handlerInput.responseBuilder
                    .speak(speakOutput)
                    .getResponse());
            }).catch(error => {
                reject(handlerInput.responseBuilder
                    .speak(`Não consegui encontrar um purificador com id ${theNumber}`)
                    .getResponse());
            });
        });   
  },
};

const GetSensorHandler = {
  canHandle(handlerInput) {
      
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetSensorIntent');
  },
  handle(handlerInput) {
        const theNumber = handlerInput.requestEnvelope.request.intent.slots.id.value;
        const URL = 'https://clean-air-api.herokuapp.com/mobile_sensor_id/';
        var speakOutput = theNumber ;
       
        return new Promise((resolve, reject) => {
            getHttp(URL, theNumber).then(response => {
                const responseJSON = JSON.parse(response);
                
                const responseName = responseJSON["name"];
                speakOutput += "O nome do sensor é " + responseName;
                
                const responseBattery = responseJSON["battery"];
                speakOutput += " A bateria do sensor está em " + responseBattery + "por cento.";
                
                const responseStatus = responseJSON["active"];
                speakOutput += " O sensor está " + responseStatus;
                
                const responseQuality = responseJSON["quality"];
                speakOutput += " A qualidade do ar está  " + responseQuality;
                
                const responseLight = responseJSON["light_status"];
                speakOutput += " A luz está  " + responseLight;
                
                const responseTemperature = responseJSON["temperature"];
                speakOutput += " A temperatura está em " + responseTemperature + " graus Celsius.";
                
                const responseHumidity = responseJSON["humidity"];
                speakOutput += " A umidade está em " + responseHumidity + " por cento.";
                
                resolve(handlerInput.responseBuilder
                    .speak(speakOutput)
                    .getResponse());
            }).catch(error => {
                reject(handlerInput.responseBuilder
                    .speak(`Não consegui encontrar um sensor com id ${theNumber}`)
                    .getResponse());
            });
        });   
  },
};

const ChangeNameHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        // checks request type
        return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
            && request.intent.name === 'ChangeSensorNameIntent');
    },
    handle(handlerInput) {
        const theNumber = handlerInput.requestEnvelope.request.intent.slots.number.value;
        const theName = handlerInput.requestEnvelope.request.intent.slots.room.value;
        const URL = 'https://clean-air-api.herokuapp.com/';
        const method = 'mobile_sensor_id/' + theNumber;
        var speakOutput = theNumber ;
        var data = { 'name' : theName};
       
        return new Promise((resolve, reject) => {
            patchHttp(URL, JSON.stringify(data), method);
        });   
    },
}

const TurnOnPurifierHandler = {
  canHandle(handlerInput) {
      
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'PowerOnPurifierIntent');
  },
  handle(handlerInput) {
        const theNumber = handlerInput.requestEnvelope.request.intent.slots.id.value;
        const URL = 'https://clean-air-api.herokuapp.com/commands_purifier/';
        var speakOutput = theNumber ;
        const method = URL + theNumber;
        var data = {'id' : theNumber, 'active' : true};
        
        return new Promise((resolve, reject) => {
            postHttp(URL, JSON.stringify(data), method);
        });   
  },
};

const TurnOffPurifierHandler = {
  canHandle(handlerInput) {
      
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'PowerOffPurifierIntent');
  },
  handle(handlerInput) {
        const theNumber = handlerInput.requestEnvelope.request.intent.slots.id.value;
        const URL = 'https://clean-air-api.herokuapp.com/commands_purifier/';
        var speakOutput = theNumber ;
        const method = URL + theNumber;
        var data = {'id' : theNumber, 'active' : false};
        
        return new Promise((resolve, reject) => {
            postHttp(URL, JSON.stringify(data), method);
        });   
  },
};


const TurnOnSensorHandler = {
  canHandle(handlerInput) {
      
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'PowerOnSensorIntent');
  },
  handle(handlerInput) {
        const theNumber = handlerInput.requestEnvelope.request.intent.slots.id.value;
        const URL = 'https://clean-air-api.herokuapp.com/commands_mobile_sensor/';
        var speakOutput = theNumber ;
        const method = URL + theNumber;
        var data = {'id' : theNumber, 'active' : true};
        
        return new Promise((resolve, reject) => {
            postHttp(URL, JSON.stringify(data), method);
        });   
  },
};

const TurnOffSensorHandler = {
  canHandle(handlerInput) {
      
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'PowerOffSensorIntent');
  },
  handle(handlerInput) {
        const theNumber = handlerInput.requestEnvelope.request.intent.slots.id.value;
        const URL = 'https://clean-air-api.herokuapp.com/commands_mobile_sensor/';
        var speakOutput = theNumber ;
        const method = URL + theNumber;
        var data = {'id' : theNumber, 'active' : false};
        
        return new Promise((resolve, reject) => {
            postHttp(URL, JSON.stringify(data), method);
        });   
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    // Gets the locale from the request and initializes i18next.
    const localizationClient = i18n.init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
      returnObjects: true
    });
    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
      // gets arguments through and passes them to
      // i18next using sprintf to replace string placeholders
      // with arguments.
      const args = arguments;
      const value = i18n.t(...args);
      // If an array is used then a random value is selected
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    // this gets the request attributes and save the localize function inside
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    }
  }
};


const getHttp = function(url, query) {
    return new Promise((resolve, reject) => {
        const request = http.get(`${url}/${query}`, response => {
            response.setEncoding('utf8');
           
            let returnData = '';
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`${response.statusCode}: ${response.req.getHeader('host')} ${response.req.path}`));
            }
           
            response.on('data', chunk => {
                returnData += chunk;
            });
           
            response.on('end', () => {
                resolve(returnData);
            });
           
            response.on('error', error => {
                reject(error);
            });
        });
        request.end();
    });
}

const postHttp = function(url, query, method){
    return new Promise(async (resolve, reject) =>{
    
        // const url = "https://clean-air-api.herokuapp.com/";
        const urlFinal = `$(url)$(method)`;

        const response =  await fetch(`urlFinal`, {
            method: 'POST',
            body: query,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': query.length
              }
        });

        const json = await response.json()
        if(!json || json.errors){
            console.error(json.errors);
        }
        resolve(json);

    });
}

const patchHttp = function(url, query, method){
    return new Promise(async (resolve, reject) =>{
    
        const urlFinal = `$(url)$(method)`;

        const response =  await fetch(`urlFinal`, {
            method: 'PATCH',
            body: query,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': query.length
              }
        });

        const json = await response.json()
        if(!json || json.errors){
            console.error(json.errors);
        }
        resolve(json);

    });
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GetPurifierHandler,
    ChangeNameHandler,
    GetSensorHandler,
    TurnOnSensorHandler,
    TurnOffSensorHandler,
    TurnOnPurifierHandler,
    TurnOffPurifierHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();
