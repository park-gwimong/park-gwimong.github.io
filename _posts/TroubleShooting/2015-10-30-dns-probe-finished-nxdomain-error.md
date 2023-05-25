---
layout: post
title: "DNS_PROBE_FINISHED_NXDOMAIN 오류"
date: 2015-10-30 09:45:00+0900
categories: TroubleShooting
tags: DNS
mathjax: true
---

해당 오류는 구글 크롬 사용 시 DNS에서 주소를 찾을 수 없는 경우에 발생하는 오류입니다.  

다른 웹브라우저를 사용해도 오류 메세지가 조금 다를 뿐 해당 웹페이지를 찾을 수 없는 오류가 발생합니다.  

VirtualBox에서 우분투를 돌리고 있는데 DNS 설정을 변경하니 해당 오류가 발생하였습니다.

wireshark로 패킷 캡쳐해보니
![error](/resource/2015/20151030/20151030-dns-error.png)

EDP(Extreme Discovery Protocol)

EDP is a vendor proprietary protocol from Extreme Networks.

즉, 가상머신에서 EDP를 통해 게스트OS의 네트워크 정보를 갱신하여 기본에 설정된 DNS가 먹통이 된것으로 판단됩니다.

해결과정 :

1. Guest OS의 DNS 정보 추가  
2. 가상머신 재부팅  
3. Host에서  
   커맨드 -> ipconfig/flushdns  
   또는  
     Network 재구동(사용안함->사용함)
