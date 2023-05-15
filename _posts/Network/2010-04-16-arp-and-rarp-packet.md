---
layout: post
title: "ARP, RARP 패킷 구조"
date: 2010-04-16 04:04:00+0900
categories: Network
tags: Protocol ARP RARP
mathjax: true
---

ARP(주소 변환 프로토콜)은 DNS에서 논리주소를 물리주소로 변환하기 위해 사용됩니다.  
변환단계는 크게 Broadcast frame으로 MAC주소로 호스트를 찾는 단계와, 해당 호스트가 Unicast frame으로 논리적인 주소인 IP를 반환시켜주는 단계로 나눌수 있습니다.  

(예 : 호스트A로 호스트B의 IP를 확인하기 위한 과정)
[1단계]  
![img](/resource/20100416/20100416-img-1.png)

[2단계]  
![img](/resource/20100416/20100416-img-2.png)

# [ARP 패킷 구조]
![img](/resource/20100416/20100416-img-3.png)  

## [하드웨어 종류]
: 해당 네트워크를 구성하는 하드웨어을 명시
![img](/resource/20100416/20100416-img-4.png)

## 작동모드
: 해당 패킷이 ARP에서 어떤 역활을 하는 패킷인지를 나타냅니다.
- ARP Request : 1
- ARP Reply: 2
- RARP Request: 3
- RARP Reply: 4
