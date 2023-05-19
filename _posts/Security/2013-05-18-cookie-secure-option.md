---
layout: post
title: "HTTP Cookie의 Secure"
date: 2000-05-18 14:47:00+0900
categories: Security
tags: Security WEB Cookie
mathjax: true
---

# Http Cookie

HTTP Cookie는 서버에 의해 브라우저에 저장되는 데이터 조각입니다.  
Cookie는 2개의 유형으로 나뉩니다.

- persistent cookies : 만료일을 가지는 쿠키로, 사용자 경험을 저장하기 위해 주로 사용
- session cookies : 세션 종료와 함께 삭제되는 쿠키로, 자격 증명 등을 저장하기 위해 주로 사용


---

# Cookie security
Http는 connectionless & Stateless(무상태성, 상태 정보를 가지 않는) 프로토콜입니다.  
서버는 요청한 클라이언트의 상태 정보를 알 수 없기 때문에,  해당 요청이 




사용자의 편의성을 개선하기 위하한 데이터는 노출이 되도 큰 문제가 없습니다.  
하지만, 자격 증명이 저장되어 있는 쿠키가 탈취 되면 보안에 큰 위협이 될 수 있습니다.  



쿠키는 Client의 브라우저에 저장되는 데이터이다 보니, 아래의 코드 한줄이면 손쉽게 획득 할 수 있습니다.
```javascript
<script> document.cookie </script>
```

특히, session cookies에 주로 저장하는 자격 증명 데이터가 탈취 된다면 매우 위험

시스템을 악의적으로 공격해 해당 시스템의 자원을 부족하게 하여 원래 의도됙 용도로 사용하지 못하게 하는 공격.
특정 서버에 수많은 접속 시도를 하도록 만들어 다른 이용자가 정상적인 서비스를 이용 할 수 없도록 만든다.

* DDos<br>
  다수의 분산된 시스템을 이용하여 Dos 공격하는 기술.<br>
  대부분의 Dos 공격은 DDos 형태인 경우가 많다.

* Flooding Attack
    + [ICMP](https://ko.wikipedia.org/wiki/ICMP) Flooding
        - Ping of Death : <br>
          규격 크기 이상의 ICMP Request를 보내는 공격<br>
          IP 패킷을 재조합할 때 Buffer Overflow 및 시스템 충돌이 발생.<br>
        - Ping Flooding : <br>
          공격 대상에 압도적인 수의 Ping 패킷을 보내면 공격 대상이 된 Host는 Ping 패킷을 처리하느라 다른 패킷들을 처리 할 수 없게 된다.
    + [IP](https://ko.wikipedia.org/wiki/IP) Flooding
        - SMURF Attack : <br>
          Broadcast 주소로 ICMP_REQUEST 패킷을 보내면 같은 네트워크에 있는 시스템들은 ICMP_REQUEST 패킷에 대한 응답(
          ICMP_ECHO_REPLY)을 공격 대상 Host에게 보낸다. <br>
        - Land Attack : <br>
          목적지와 출발지가 모두 공격 대상 Host의 주소인 IP 패킷을 공격 대상 Host에 보내는 공격<br>
          대상 Host는 해당 패킷에 대한 reply 패킷을 자신에게 보내고, 그 패킷에 대한 응답을 또 다시 자신에게 보내면서 무한 루프에 빠지게 된다.<br>
        - Teardrop Attack : <br>
          데이터의 송수신과정에서 데이터의 송신한계를 넘으면 분할하여 fragment number를 붙여 송신하고, 수신측에서는 fragment number로 재좁하여
          데이터를 수신한다.<br>
          이 때 fragment number를 변조하여 공격 대상 Host가 해당 IP 패킷을 재조합하지 못하고, 이로 인한 시스템의 장애가 발생하도록 유도함.<br>
        - Inconsistent Fragment Attack : <br>

    + [TCP](https://ko.wikipedia.org/wiki/TCP) Flooding
        - SYN Flooding : <br>
          TCP/SYN 패킷의 Flood를 보내면서 대개 송신자의 주소를 위조한다.<br>
          공격 대상이 된 Host는 TCP/SYN 패킷을 수신하면, 해당 패킷의 송신자 주소로부터 응답을 기다리게 된다. <br>
          하지만 해당 TCP/SYN의 송신자 주소는 위조된 주소이므로 응답 패킷을 보내주지 않는다.<br>
          이러한 변조된 TCP/SYN 패킷으로 인해 공격 대상 Host의 접속 수용 범위를 벗어나게 되면 공격이 지속되는 동안 정당한 요청에 응답할 수 없게 된다.
        - Except SYN Flag Flooding attack : <br>
          SYN이 아닌 다른 flag를 이용.
    + [UDP](https://ko.wikipedia.org/wiki/UDP) Flooding
        - UDP Traffic Flooding : <br>
          대량의 UDP 패킷을 공격 대상 Host에게 전송하여 서버의 과부하를 유발시킨다.
        - DNS Flooding : <br>
          DNS에 과도한 트래픽을 발생 시키는 질의를 요청하여 DNS에 과부하를 유발시킨다.<br>
        - Fraggle Attack : <br>
          SMURF Attack과 유사. 다른 점은 ICMP가 아닌 UDP를 이용한다.
    + Session Table Flooding
    + [HTTP](https://ko.wikipedia.org/wiki/HTTP) Flooding
        - HTTP GET Flooding : <br>
          TCP 연결 과정 이후 정상적인 HTTP Get 패킷을 공격 대상 Host에 전송하여 서버에 과부하를 유발시킨다.
        - HTTP GET Flooding with Cache-Control Attack(HTTP CC Atack) : <br>
          HTTP Get Flooding이 기본적인 HTTP 요청을 하는 반면에 HTTP CC Attack은 HTTP Get Flooding보다 더 많은 부하를 발생시키기
          위해 'Cache-Control'이라는 옵션 값을 사용한다.
        - Dynamic Http Request Flooding : <br>
          HTTP GET Flooding이나 HTTP CC Atack와 같이 일반적으로 웹 페이지를 지속적으로 요청하는 DDos 공격은 HTTP 요청 패턴으로 방어가
          가능하다.<br>
          이러한 방어를 회피하기 위하여 정해진 웹페이지를 요청하는 것이 아니라 지속적으로 요청 페이지를 변경하며 공격 하는 기술이다.

# Spoofing

Spoofing의 사전적 의미는 '속이다'이다.
네트워크 공격에서 Spoofing 대상은 MAC Address, Ip Address, Port 등 네트워크 통신과 관련된 모든 것이 될 수 있다.

* [ARP](https://ko.wikipedia.org/wiki/ARP) Spoofing : <br>
  ARP Spoofing은 MAC 주소를 속여 네트워크의 흐름을 왜곡시키는 공격이다. 공격자의 Mac address를 공격 대상 Host의 Mac address로 속여 공격 대상
  Host의 패킷을 가로 챌 수 있다.
* DNS Spoofing : <br>
  사용자가 DNS에 특정 도메인 주소를 요청하였을 때 정상적인 IP 주소가 아닌 공격자가 설정한 IP 주소로 대응시켜 주는 공격.
* [IP](https://ko.wikipedia.org/wiki/IP) Spoofing : <br>
  공격자 자신의 IP를 속여 시스템에 접근함으로써 이 후 IP address 추적을 회피하는 해킹 기법의 일종이다.
* [Watchdog](https://ko.wikipedia.org/wiki/워치독_타이머) Spoofing : <br>
  공격 대상 Host(Server)에 존재하는 Client Session을 active 상태로 유지시키기 위한 watchdog 패킷을 지속적으로 보내 Session이 계속 유지
  되도록 한다.<br>
  기존 Session이 계속 유지 되면서 서버가 허용한 Session 수를 초과하면, 정상적인 Session이 처리 되지 못하게 된다.
* Email Spoofing

# Sniffing

* Passive Sniffing<br>
  단순히 네트워크의 패킷을 청취 및 트래픽 캡처를 하는 행위.
* Active Sniffing <br>
  Traffic을 캡처하기 위해 스위치와 같은 네트워크 장비에 ARP Spoofing 또는 Traffic Flooding 공격 등을 포함한 행위.
    + Switch Jamming : <br>
      Switch의 Mac Table에 위조된 패킷을 전송하여 Mac Table의 Over Flow을 유발시킨다. 이 후 Switch는 패킷을 Brodcasting하게 된다.
    + ARP Redirect : <br>
      위조된 ARP reply를 보내 공격자를 라우터로 속여 공격 대상 Host들의 패킷이 공격자를 거쳐 라우팅 되도록 하는 공격.
    + ICMP Redirect : <br>
      Router에게 올바른 경로를 알려주는데 사용되는 ICMP Redirect 패킷을 위조하여 공격 대상 Host의 패킷이 공격자에게 Redirect 되도록 한다.
    + ICMP Router Advertisement<br>

# Scanning

* Footprinting<br>
  사회공학(Social Engineering) 기법 등을 이용하여 공격 대상 Host의 정보를 수집하는 방법.
* Port Scanning<br>
  공격 대상 Host의 Port를 통해 세부적인 정보를 수집하기 위한 방법.
    + Sweeps
        - ICMP Sweep
        - TCP Sweep
        - UDP Sweep
    + Open Scan
        - TCP Full Open Scan
        - TCP Half Open Scan
        - UDP Scan
    + Stealth Scan
        - FIN Scan
        - NULL Scan
        - XMAS Scan
        - ACK Scan
        - Fragment Scan

# Session Hijacking

Server와 Client 사이의 Session을 가로채는 기술.

* Firesheep : <br>
  웹 사이트에서 암호화되지 않은 세션 쿠키를 가로채기 위한 Packet Sniffer로써 Firefox 웹 브라우저의 확장 기능.
* WhatsApp sniffer<br>
* DroidSheep : <br>
  Android 기반 Session Hijacking 도구
* CookieCadger : <br>
  HTTP 요청의 sidejacking 및 replay을 자동화해주는 Java 기반 응용 프로그램.
