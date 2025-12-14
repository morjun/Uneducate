(function() {
    // 기존 XMLHttpRequest 함수 저장
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    // open 함수 재정의 (URL 캡처용)
    XMLHttpRequest.prototype.open = function(method, url) {
        this._url = url;
        return originalOpen.apply(this, arguments);
    };

    // send 함수 재정의 (데이터 변조용)
    XMLHttpRequest.prototype.send = function(body) {
        if (this._url && body) {
            try {
                // 주기적 학습 로그 (addtnlLnrLog.do) 처리
                if (this._url.includes('addtnlLnrLog.do')) {
                    const data = JSON.parse(body);
                    if (data.playbackRate !== 1) {
                        console.log(`[주기 로그 변조] playbackRate: ${data.playbackRate} -> 1`);
                        data.playbackRate = 1;
                        body = JSON.stringify(data);
                    }
                } 
                // 최종 학습 완료 보고 (updateLrnHisLog.do) 처리

                // 최종 학습 완료 보고 (updateLrnHisLog.do) 처리
                else if (this._url.includes('updateLrnHisLog.do')) {
                    console.log('[최종 보고 감지] 서버가 요구하는 형태로 데이터를 최종 변조합니다.');
                    const data = JSON.parse(body);
                    const player = videojs.getPlayers()['lx-player'];
                    const duration = Math.floor(player.duration());

                    // 1. 총 재생시간과 종료위치를 영상 전체 길이로 강제 설정
                    console.log(`[데이터 변조] 재생시간(plytmSs)과 종료위치(plyEndHr)를 ${duration}초로 설정합니다.`);
                    data.plytmSs = duration;
                    data.plyEndHr = duration;

                    // 2. 시작위치를 0으로 설정
                    // console.log(`[데이터 변조] 시작위치(plyBgngHr)를 0으로 설정합니다.`);
                    // data.plyBgngHr = 0;

                    // 3. 탐색 횟수를 0으로 초기화
                    console.log(`[데이터 변조] 탐색횟수(seekCnt)를 0으로 설정합니다.`);
                    data.seekCnt = 0;

                    // 4. 마우스/클릭 로그를 비워서 의심스러운 기록 제거
                    console.log(`[데이터 변조] 마우스 및 클릭 로그를 비웁니다.`);
                    data.overBuffer = [];
                    data.clickBuffer = [];

                    // 5. 서버가 요구하는 완료 상태 값으로 강제 설정
                    console.log('[데이터 변조] playerMode를 "interval"로, isPause를 false로 설정합니다.');
                    data.playerMode = 'interval';
                    data.isPause = false;
                    data.stuCmptnYn = 'Y';
                    data.stuCmptnSttusVal = 'completed';
                    data.stuCmptnCgYn = 'N';
                    data.autouseyn = 'N';

                    body = JSON.stringify(data);
                }
            } catch (e) {
                // 파싱 실패 시 원본 데이터 전송
            }
        }
        // 변조된 데이터로 실제 요청 전송
        return originalSend.apply(this, [body]);
    };

    console.log("[최종 학습 로그 감지기 활성화] 두 종류의 학습 로그를 모두 감시하고 데이터를 수정합니다.");
})();

// var p = videojs.getPlayers()['lx-player']; 
// p.currentTime(p.duration());
//videojs.getPlayers()['lx-player'].playbackRate(16);