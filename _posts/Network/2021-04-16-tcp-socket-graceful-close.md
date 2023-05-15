---
layout: post
title: "TCP/IP 소켓의 우아한 종료(Graceful shutdown)"
date: 2021-04-16 17:024:00+0900
categories: Network
tags: Protocol Socket
mathjax: true
---

# TCP/IP 소켓
## 소켓이란?
네트워크 소켓(Network Socket)은 1982년 BSD(Bekelley software Distribution0 UNIX 4.1에서 처음 소개 되었으며, 컴퓨터 네트워크를 경유하는 **프로세스 간 통신**의 종착점이며 이를 통해 서로 데이터를 교환합니다.  

## TCP/IP 소켓?
오늘날 컴퓨터 간 통신의 대부분은 인터넷 프로토콜을 기반으로 하고 있으며, TCP/IP Layer에서 사용되는 소켓을 TCP/IP 소켓이라고 합니다.

# TCP/IP 소켓 통신
## 소켓 통신 과정
소켓 통신은 일반적으로 아래의 4단계의 과정을 거쳐 데이터를 교환합니다.  
1. 소켓 생성 : 서버와 클라이언트에서 각각 소켓을 생성합니다.  
2. 소켓 연결  
: 서버의 소켓은 클라이언트로부터 연결 요청이 올 때가지 기다리고,  
: 클러이언트 소켓은 서버로 연결을 요청합니다.
3. 데이터 송신 : 서버와 클라이언트 소켓이 정상적으로 연결되면, 데이터를 송수신합니다.
4. **소켓 연결 종료** : 서버와 클라이언트는 소켓의 연결을 종료합니다.

소켓을 연결 할 때는 3-way handshake 방식을 이용하는데, 이러한 절차는 TCP/IP 접속을 성공적으로 성립하기 위하여 반드시 필요합니다.

반변, 소켓의 연결을 종료 할 때는 4-way handshake 방시기을 이용하는데, 서비스의 환경에 따라 조금씩 다르게 사용하는 경우가 있습니다.  

이번 글에서 정리하고 하는 부분은 바로 **소켓 연결 종료** 부분입니다.

# TCP/IP 소켓 종료
![img](/resource/20210416/20210416-%20img-1.png)
1. 연결 종료 요청 : Client가 Server로 연결을 종료 하겠다는 FIN 플래그를 전송하고 Client는 FIN_WAIT 상태가 됩니다.  
2. 연결 종료 준비 : Server는 FIN 플래그를 확인햇다는 ACK 플래그를 전송하면서 통신이 끝날때까지 TIME_WAIT 상태가 됩니다.  
3. Server의 통신이 끝나면, Client에게 FIN 플래그를 전송합니다.  
4. Client는 자신의 소켓을 종료하고 정상적으로 연결을 해제하였다는 ACK 플래그를 Server에게 전송합니다.  

## 일반적인 닫기(Normal close)
Client와 Server가 연결 종료 프로세스에 따라 안전하게 소켓을 종료하는 방법입니다.  

<br>

# 강제적인 닫기(abortive close)  
Socket의 연결을 강제로 종료하는 방법입니다.  

일반적으로 통신을 하다보면 네트워크 환경이나 다른 이유들로 인해 연결을 종료해야 할 시점을 확인하기 어려울 경우가 발생합니다.  

만약 Client나 Server의 네트워크 환경이 그리 좋지 않아 연결 종료 요청을 하지 못하는 상황이 빈번하게 발생하는 환경이라면, Server의 많은 소켓이 종료되지 않고 계속 열려 있는 상태로 유지가 됩니다.  
이러한 상황은 자원의 심각한 낭비가 될 수 있을 뿐만 아니라 서비스 장애를 유발 할 수도 있습니다.  

또한, Server가 Client의 연결 종료 시점을 알아야 할 필요가 없는 서비스나 아주 조금의 데이터의 손실은 크게 영향이 없는 서비스 등 서비스의 환경에 따라 각자 일방적으로 소켓을 종료시키는 방법이 유리 할 수도 있습니다.

<br>

# 소켓의 우아한 종료(Gracefully Close)
## 우아한 종료란?

영어 단어가 함축하고 있는 의미를 가진 단어가 한국어에는 없는 경우, 해당 단어를 표현하는 것은 매우 어려운 일입니다.  
"우아한 종료(Gracefully Close)"도 마찬가지입니다.  

TCP/IP의 Bible이라고 불리는 Richard W. Stevens의 TCP/IP Illustrated Volume 1에서 TCP 연결과 종료를 설명하며 다음과 같은 글이 있습니다.

> The seven segments we have seen are baseline overheads for any TCP connection that is established and cleared "gracefully". (There are more abrupt ways to tear down a TCP connection using special reset segments, which we cover later)

위 인용구에서 "gracefully"란 단어로 표현하고 있는데, 이를 직역하면 "우아한"이 됩니다.  

즉, Gracefull Close는  
**"유예 기간을 두고 앞서 전송된 패킷 모두가 정상적으로 전송 된 뒤에 안정적으로 연결을 종료 하는 것"**  
을 말합니다.  

<br>

## Half-close
Socket에는 입력과 출력을 위한 버퍼가 각각 존재하는데,  
연결이 정상적으로 완료되면 아래 그림과 같이 입출력 스트림이 2개가 생성됩니다.  
![img](/resource/20210416/20210416-img-2.png)  

Half-close는 2개의 스트림 중 하나만 종료하는 방법입니다.  

즉, 전송이 완료된 Socket에선 출력을 위한 버퍼를 종료하고, 입력을 위한 버퍼는 일정 기간 유지하여 데이터의 손실을 방지하는 것입니다.  

Gracefully close와 Half-close를 동일한 용어로 사용하는 경우가 많은데,  
> 소켓을 Gracefully하게 Close 하기 위해 Half-Close라는 옵션을 많이 사용하고 있다.  

라고 정리하는게 좀 더 정확한 표현 같습니다.  

## Gracefully Close 방법
가장 간단한 방법은 소켓의 linger 옵션을 설정하는 것입니다.  
해당 옵션의 활성화 여부에 따라, gracefully close가 발생하거나 Time-out으로 인해 종료되도록 설정 할 수 있습니다.  

또는, Application Protocol을 만들어 Application layer에서 Socket 연결을 제어할 수 있습니다.  

Microsoft에서는 Windows 소켓의 우아한 종료 방법에 대해  ["Graceful Shutdown, Linger Options, and Socket Closure"](
https://learn.microsoft.com/en-us/windows/win32/winsock/graceful-shutdown-linger-options-and-socket-closure-2) 문서를 제공하고 있으니, 한번 읽어보시길 권장드립니다.  

