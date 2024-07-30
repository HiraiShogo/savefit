const app_id = document.getElementById('app_id').textContent;
const secret_key = document.getElementById('secret_key').textContent;

const { nowInSec, SkyWayAuthToken, SkyWayContext, SkyWayRoom, SkyWayStreamFactory, uuidV4 } = skyway_room;
const token = new SkyWayAuthToken({
    jti: uuidV4(),
    iat: nowInSec(),
    exp: nowInSec() + 60 * 60 * 24,
    scope: {
      app: {
        id: app_id,
        turn: true,
        actions: ['read'],
        channels: [
          {
            id: '*',
            name: '*',
            actions: ['write'],
            members: [
              {
                id: '*',
                name: '*',
                actions: ['write'],
                publication: {
                  actions: ['write'],
                },
                subscription: {
                  actions: ['write'],
                },
              },
            ],
            sfuBots: [
              {
                actions: ['write'],
                forwardings: [
                  {
                    actions: ['write'],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  }).encode(secret_key);


(async () => {
console.log(app_id);
console.log(secret_key);
const Room1People = document.getElementById('room1-people');
const Room2People = document.getElementById('room2-people');
const Room3People = document.getElementById('room3-people');
const Room4People = document.getElementById('room4-people');
const Room5People = document.getElementById('room5-people');
const Room6People = document.getElementById('room6-people');
const Room7People = document.getElementById('room7-people');
const Room8People = document.getElementById('room8-people');
const Room9People = document.getElementById('room9-people');
const Room10People = document.getElementById('room10-people');

const Room1Link = document.getElementById('room1-a');
const Room2Link = document.getElementById('room2-a');
const Room3Link = document.getElementById('room3-a');
const Room4Link = document.getElementById('room4-a');
const Room5Link = document.getElementById('room5-a');
const Room6Link = document.getElementById('room6-a');
const Room7Link = document.getElementById('room7-a');
const Room8Link = document.getElementById('room8-a');
const Room9Link = document.getElementById('room9-a');
const Room10Link = document.getElementById('room10-a');

  
const context = await SkyWayContext.Create(token);

const room1 = await SkyWayRoom.FindOrCreate(context, {type: 'sfu',name: "1"});
const room2 = await SkyWayRoom.FindOrCreate(context, {type: 'sfu',name: "2"});
const room3 = await SkyWayRoom.FindOrCreate(context, {type: 'sfu',name: "3"});
const room4 = await SkyWayRoom.FindOrCreate(context, {type: 'sfu',name: "4"});
const room5 = await SkyWayRoom.FindOrCreate(context, {type: 'sfu',name: "5"});
const room6 = await SkyWayRoom.FindOrCreate(context, {type: 'sfu',name: "6"});
const room7 = await SkyWayRoom.FindOrCreate(context, {type: 'sfu',name: "7"});
const room8 = await SkyWayRoom.FindOrCreate(context, {type: 'sfu',name: "8"});
const room9 = await SkyWayRoom.FindOrCreate(context, {type: 'sfu',name: "9"});
const room10 = await SkyWayRoom.FindOrCreate(context, {type: 'sfu',name: "10"});

var Room1PeopleNum = room1.members.length;
var Room2PeopleNum = room2.members.length;
var Room3PeopleNum = room3.members.length;
var Room4PeopleNum = room4.members.length;
var Room5PeopleNum = room5.members.length;
var Room6PeopleNum = room6.members.length;
var Room7PeopleNum = room7.members.length;
var Room8PeopleNum = room8.members.length;
var Room9PeopleNum = room9.members.length;
var Room10PeopleNum = room10.members.length;

const max_people = 50;

Room1People.textContent = Room1PeopleNum + "/" + max_people;
Room2People.textContent = Room2PeopleNum + "/" + max_people;
Room3People.textContent = Room3PeopleNum + "/" + max_people;
Room4People.textContent = Room4PeopleNum + "/" + max_people;
Room5People.textContent = Room5PeopleNum + "/" + max_people;
Room6People.textContent = Room6PeopleNum + "/" + max_people;
Room7People.textContent = Room7PeopleNum + "/" + max_people;
Room8People.textContent = Room8PeopleNum + "/" + max_people;
Room9People.textContent = Room9PeopleNum + "/" + max_people;
Room10People.textContent = Room10PeopleNum + "/" + max_people;

if (Room1PeopleNum<max_people){
    Room1Link.style.border = "3mm ridge #AAFFFF";
}else{
    Room1Link.style.border = "3mm ridge #DDDDDD";
    Room1Link.style.backgroundColor = "#DDDDDD";
}
if (Room2PeopleNum<max_people){
    Room2Link.style.border = "3mm ridge #AAFFFF";
}else{
    Room2Link.style.border = "3mm ridge #DDDDDD";
    Room2Link.style.backgroundColor = "#DDDDDD";
}
if (Room3PeopleNum<max_people){
    Room3Link.style.border = "3mm ridge #AAFFFF";
}else{
    Room3Link.style.border = "3mm ridge #DDDDDD";
    Room3Link.style.backgroundColor = "#DDDDDD";
}
if (Room4PeopleNum<max_people){
    Room4Link.style.border = "3mm ridge #AAFFFF";
}else{
    Room4Link.style.border = "3mm ridge #DDDDDD";
    Room4Link.style.backgroundColor = "#DDDDDD";
}
if (Room5PeopleNum<max_people){
    Room5Link.style.border = "3mm ridge #AAFFFF";
}else{
    Room5Link.style.border = "3mm ridge #DDDDDD";
    Room5Link.style.backgroundColor = "#DDDDDD";
}
if (Room6PeopleNum<max_people){
    Room6Link.style.border = "3mm ridge #AAFFFF";
}else{
    Room6Link.style.border = "3mm ridge #DDDDDD";
    Room6Link.style.backgroundColor = "#DDDDDD";
}
if (Room7PeopleNum<max_people){
    Room7Link.style.border = "3mm ridge #AAFFFF";
}else{
    Room7Link.style.border = "3mm ridge #DDDDDD";
    Room7Link.style.backgroundColor = "#DDDDDD";
}
if (Room8PeopleNum<max_people){
    Room8Link.style.border = "3mm ridge #AAFFFF";
}else{
    Room8Link.style.border = "3mm ridge #DDDDDD";
    Room8Link.style.backgroundColor = "#DDDDDD";
}
if (Room9PeopleNum<max_people){
    Room9Link.style.border = "3mm ridge #AAFFFF";
}else{
    Room9Link.style.border = "3mm ridge #DDDDDD";
    Room9Link.style.backgroundColor = "#DDDDDD";
}
if (Room10PeopleNum<max_people){
    Room10Link.style.border = "3mm ridge #AAFFFF";
}else{
    Room10Link.style.border = "3mm ridge #DDDDDD";
    Room10Link.style.backgroundColor = "#DDDDDD";
}

Room1Link.addEventListener('mouseover', function() {
    if (Room1PeopleNum<max_people){Room1Link.style.borderColor = "#00FFFF";}
});
Room2Link.addEventListener('mouseover', function() {
    if (Room2PeopleNum<max_people){Room2Link.style.borderColor = "#00FFFF";}
});
Room3Link.addEventListener('mouseover', function() {
    if (Room3PeopleNum<max_people){Room3Link.style.borderColor = "#00FFFF";}
});
Room4Link.addEventListener('mouseover', function() {
    if (Room4PeopleNum<max_people){Room4Link.style.borderColor = "#00FFFF";}
});
Room5Link.addEventListener('mouseover', function() {
    if (Room5PeopleNum<max_people){Room5Link.style.borderColor = "#00FFFF";}
});
Room6Link.addEventListener('mouseover', function() {
    if (Room6PeopleNum<max_people){Room6Link.style.borderColor = "#00FFFF";}
});
Room7Link.addEventListener('mouseover', function() {
    if (Room7PeopleNum<max_people){Room7Link.style.borderColor = "#00FFFF";}
});
Room8Link.addEventListener('mouseover', function() {
    if (Room8PeopleNum<max_people){Room8Link.style.borderColor = "#00FFFF";}
});
Room9Link.addEventListener('mouseover', function() {
    if (Room9PeopleNum<max_people){Room9Link.style.borderColor = "#00FFFF";}
});
Room10Link.addEventListener('mouseover', function() {
    if (Room10PeopleNum<max_people){Room10Link.style.borderColor = "#00FFFF";}
});


Room1Link.addEventListener('mouseleave', function() {
    if (Room1PeopleNum<max_people){Room1Link.style.borderColor = "#AAFFFF";}
});
Room2Link.addEventListener('mouseleave', function() {
    if (Room2PeopleNum<max_people){Room2Link.style.borderColor = "#AAFFFF";}
});
Room3Link.addEventListener('mouseleave', function() {
    if (Room3PeopleNum<max_people){Room3Link.style.borderColor = "#AAFFFF";}
});
Room4Link.addEventListener('mouseleave', function() {
    if (Room4PeopleNum<max_people){Room4Link.style.borderColor = "#AAFFFF";}
});
Room5Link.addEventListener('mouseleave', function() {
    if (Room5PeopleNum<max_people){Room5Link.style.borderColor = "#AAFFFF";}
});
Room6Link.addEventListener('mouseleave', function() {
    if (Room6PeopleNum<max_people){Room6Link.style.borderColor = "#AAFFFF";}
});
Room7Link.addEventListener('mouseleave', function() {
    if (Room7PeopleNum<max_people){Room7Link.style.borderColor = "#AAFFFF";}
});
Room8Link.addEventListener('mouseleave', function() {
    if (Room8PeopleNum<max_people){Room8Link.style.borderColor = "#AAFFFF";}
});
Room9Link.addEventListener('mouseleave', function() {
    if (Room9PeopleNum<max_people){Room9Link.style.borderColor = "#AAFFFF";}
});
Room10Link.addEventListener('mouseleave', function() {
    if (Room10PeopleNum<max_people){Room10Link.style.borderColor = "#AAFFFF";}
});


Room1Link.addEventListener('click', function(){
    if (Room1PeopleNum<max_people){
        Room1Link.setAttribute('href', "/live?room=1&roompeople="+String(room1.members.length))}
    else{Room1Link.setAttribute('href', "javascript:void(0)");}});
Room2Link.addEventListener('click', function(){
    if (Room2PeopleNum<max_people){
        Room2Link.setAttribute('href', "/live?room=2&roompeople="+String(room2.members.length))}
    else{Room2Link.setAttribute('href', "javascript:void(0)");}});
Room3Link.addEventListener('click', function(){
    if (Room3PeopleNum<max_people){
        Room3Link.setAttribute('href', "/live?room=3&roompeople="+String(room3.members.length))}
    else{Room3Link.setAttribute('href', "javascript:void(0)");}});
Room4Link.addEventListener('click', function(){
    if (Room4PeopleNum<max_people){
        Room4Link.setAttribute('href', "/live?room=4&roompeople="+String(room4.members.length))}
    else{Room4Link.setAttribute('href', "javascript:void(0)");}});
Room5Link.addEventListener('click', function(){
    if (Room5PeopleNum<max_people){
        Room5Link.setAttribute('href', "/live?room=5&roompeople="+String(room5.members.length))}
    else{Room5Link.setAttribute('href', "javascript:void(0)");}});
Room6Link.addEventListener('click', function(){
    if (Room6PeopleNum<max_people){
        Room6Link.setAttribute('href', "/live?room=6&roompeople="+String(room6.members.length))}
    else{Room6Link.setAttribute('href', "javascript:void(0)");}});
Room7Link.addEventListener('click', function(){
    if (Room7PeopleNum<max_people){
        Room7Link.setAttribute('href', "/live?room=7&roompeople="+String(room7.members.length))}
    else{Room7Link.setAttribute('href', "javascript:void(0)");}});
Room8Link.addEventListener('click', function(){
    if (Room8PeopleNum<max_people){
        Room8Link.setAttribute('href', "/live?room=8&roompeople="+String(room8.members.length))}
    else{Room8Link.setAttribute('href', "javascript:void(0)");}});
Room9Link.addEventListener('click', function(){
    if (Room9PeopleNum<max_people){
        Room9Link.setAttribute('href', "/live?room=9&roompeople="+String(room9.members.length))}
    else{Room9Link.setAttribute('href', "javascript:void(0)");}});
Room10Link.addEventListener('click', function(){
    if (Room10PeopleNum<max_people){
        Room10Link.setAttribute('href', "/live?room=10&roompeople="+String(room10.members.length))}
    else{Room10Link.setAttribute('href', "javascript:void(0)");}});

})();

// join - leave 切り替え
