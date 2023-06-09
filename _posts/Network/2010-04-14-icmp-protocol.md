---
layout: post
title: "ICMP 프로토콜 분석"
date: 2010-04-14 04:04:00+0900
categories: Network
tags: Protocol ICMP
mathjax: true
---

IP 프로토콜은 오류제어에 대한 메커니즘이 포함되어 있지 않습니다.  
단지 수신 주소로 패킷을 보내버릴뿐 해당 패킷이 안전하게 도착하였는지는 체크하지 못한다는 말입니다.   그렇기때문에 IP 프로토콜만으로는 올바른 데이터 전송을 할 수 없습니다. 이를 해결하기 위해 같이 사용하는 프로토콜이 바로 ICMP 프로토콜입니다.  

즉, ICMP 프로토콜은 송신 호스트에게 IP 전달에 대한 다양한 메세지를 전달하기 위한 프로토콜입니다.  

개념적으로는 TCP/IP 아키텍처중 Internet 계층에 속하며 IP 모듈내에 ICMP 모듈이 포함된 형태라고 보시면 됩니다.  

# [ICMP 패킷 구조]
![img](/resource/2010/20100414/20100413-img-1.png)

총 8바이트의 헤더로 구성되어 있습니다.  
Type에는 해당 ICMP 패킷이 어떠한 종류의 ICMP 메세지를 보내는 패킷인지 나타내는 것이고 Code에는 해당 종류의 메세지 중 세부사항 메세지를 의미하는 코드 값입니다.  

Type에는 매우 많은 종류가 있는데, 그 중에 많이 사용하는 유형 몇가지만 알아볼 것입니다.  

---

## <Type 0> 과 <Type 8>
IP노드와 네트워크 간의 통신이 가능한지를 확인 하기 위해 사용됩니다.
Echo Request(0)을 보내면 Echo Reply(8)이 응답하는 방식으로 동작합니다
(ex : ping 프로그램)

---

## <Type 3>
IP 패킷이 목적지에 제대로 전달되지 않은 경우 일반적으로 라우터에게 탐지가 되는데 이때 라우터가 출발지 호스트에게 보낼때 사용됩니다.  

[Type3 코드 표]
![img](/resource/2010/20100414/20100413-img-2.png)

---

## <Type 4>
라우터에서 받는 패킷의 전송 속도가 보내는 전송 속도보다 클 경우, 임시로 패킷을 버퍼에 임시로 저장을 하게 되는데, 버퍼가 다 차버릴 경우 그 뒤에 받는 패킷은 버릴수 밖에 없게 됩니다. 그렇기 때문에 버퍼가 다 차기 전에 어느정도 버퍼를 비워줘야 하는데 그러기 위해 라우터에게 패킷을 보내는 호스트에게 패킷을 천천히 보낼 것을 요청을 해야 합니다. 이 때 사용됩니다.

---

## <Type 5>
좀 더 최적에 가까운 경로가 탐지 되었을 경우 패킷을 보내는 호스트에게 이를 알림으로 패킷이 좀 더 최적의 가까운 경로로 보내질 수 있도록 유도할 때 사용됩니다.  

[Type5 패킷 구조]
![img](/resource/2010/20100414/20100413-img-3.png)

---

## <Type 9>
라우터에서 동적으로 생성되어 있는 라우터를 탐지하기 위해 사용됩니다.  

[Type9 패킷 구조]
![img](/resource/2010/20100414/20100413-img-4.png)

- 번호 주소 : 패킷을 발생시키는 라우터의 주소
- 주소 항목 크기 : 라우터 주소에 대한 정보의 32비트 워드 수
- 수명 : 라우터가 올바로 작동하고 있는지 신뢰할 수 있는 최대의 시간, 명시된 시간이 지나면 자동으로 삭제 됩니다.
- 라우터 주소 : 응답한 라우터의 주소
- 우선권 수준 : 이 값이 클 수록 최적

---

## <Type 10>
호스트에서 해당 지역에 존재하는 라우터 IP 주소를 획득하기 위해 사용됩니다.

---

## <Type 11>
TTL값이 0이 되어 패킷을 폐기하야 하거나 단편화된 패킷이 모두 도달하지 않아 재조립이 불가능할 때  출발지 호스트에게 이를 알리기 위해 사용됩니다.  
![img](/resource/2010/20100414/20100413-img-5.png)
- 코드 값이 0 : TTL 값이 0이 되어버렸을 때 라우터에서 생성
- 코드 값이 1 : 단편 재조립이 불가능 할 때 호스트에서 생성

---

## <Type 15> <Type 16>
저장매체가 없는 요청 호스트의 IP 주소를 알아내기 위해 사용됩니다.  
- 15 : 요청한 호스트의 IP 주소를 알기 위한 질문
- 16 : 요청한 호스트이 IP 주소에 대한 응답

RARP, BOOTP 또는 DHCP에서 사용할 것을 권장하고 있습니다.

[Type 15, 16 패킷 구조]
![img](/resource/2010/20100414/20100413-img-6.png)

---

## <Type 17> <Type 18>
저장매체가 없는 특정 호스트가 서브넷 마스크를 획득하기 위해 사용됩니다.  
- 17 : 요청한 호스트의 서브넷 마스크를 알기 위한 질문
- 18 : 요청한 호스트의 서브넷 마스크를 알기 위한 응답

[Type 17, 18 패킷 구조]
![img](/resource/2010/20100414/20100413-img-7.png)