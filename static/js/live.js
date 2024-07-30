const app_id = document.getElementById('app_id').textContent;
const secret_key = document.getElementById('secret_key').textContent;
const room_num = document.getElementById('room_num').textContent;


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
// 1
const localVideo = document.getElementById('local-video');

const { audio, video } = await SkyWayStreamFactory.createMicrophoneAudioAndCameraStream({
    video: { height: 144, width: 256, frameRate: 1 },
}); // 2

video.attach(localVideo); // 3
await localVideo.play(); // 4


const remoteMediaArea = document.getElementById('remote-media-area');
const AirDisplay = document.getElementById('air-display');
const JoinLeaveButton = document.getElementById('join-leave-button');
var me;

async function livefunc(){
  if (room_num === '') return;
    
  const context = await SkyWayContext.Create(token);
  let room = await SkyWayRoom.FindOrCreate(context, {
      type: 'sfu',
      name: room_num,
  });
    
  // ルーム参加 Memberオブジェクトをmeに格納
  me = await room.join();
  
  // 送信
  let max_members = 50;
  await me.publish(video, { maxSubscribers: max_members });

  
  
  // 受信
  const subscribeAndAttach = async (publication) => {
    if (publication.publisher.id === me.id) return;


    const { stream } = await me.subscribe(publication.id);

    let newMedia;
    if (stream.track.kind == 'video'){
      newMedia = document.createElement('video');
      newMedia.playsInline = true;
      newMedia.autoplay = true;
      newMedia.setAttribute(
          'data-member-id',
          publication.publisher.id
      );
    }else{
      return;
    }

    stream.attach(newMedia);
    remoteMediaArea.appendChild(newMedia);

  };

  room.publications.forEach(subscribeAndAttach);
  room.onStreamPublished.add((e) => subscribeAndAttach(e.publication));

  const disposeVideoElement = (remoteVideo) => {
    const stream = remoteVideo.srcObject;
    stream.getTracks().forEach((track) => track.stop());
    remoteVideo.srcObject = null;
    remoteVideo.remove();
  };

  // 誰かが退出
  room.onMemberLeft.add((e) => {
    if (e.member.id === me.id) return;

    console.log(`${e.member.id}が退出しました`);
    console.log(`${room.members.length}人`);
    
    

    const remoteVideo = remoteMediaArea.querySelector(
      `[data-member-id="${e.member.id}"]`
    );
    disposeVideoElement(remoteVideo);

  });
  // 自分が退出
  me.onLeft.once(() => {
    Array.from(remoteMediaArea.getElementsByTagName('video')).forEach((element) => {
      disposeVideoElement(element);
    });
    console.log("自分が退出しました");
    room.dispose();
    room = undefined;
  });



}

JoinLeaveButton.onclick = () => {

  if (JoinLeaveButton.textContent === '配信開始'){
    JoinLeaveButton.textContent = '配信終了';
    JoinLeaveButton.style.backgroundColor = "#EE0000";
    AirDisplay.textContent = 'ON AIR';
    AirDisplay.style.backgroundColor = "#FF0000";
    AirDisplay.style.fontSize = "20px";
    livefunc();
  }else{
    JoinLeaveButton.textContent = '配信開始';
    JoinLeaveButton.style.backgroundColor = "#2C7CFF";
    AirDisplay.textContent = 'OFF AIR';
    AirDisplay.style.backgroundColor = "gray";
    AirDisplay.style.fontSize = "20px";
    
    me.leave();
  }

}



})();

// join - leave 切り替え
