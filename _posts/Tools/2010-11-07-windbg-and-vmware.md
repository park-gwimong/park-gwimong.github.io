---
layout: post
title: "윈도우 환경에서 커널 디버깅하기"
subtitle: "Windbg와 vmwarfe 연경"
date: 2010-11-07 17:35:00+0900
categories: Etc
tags: Tools Vmware WinDBG
mathjax: true
---

vmware를 이용하여 커널 디버깅하기 위한 환경 설정 하는 자료는 구글링을 하시면 쉽게 찾을수 있습니다.
하지만 옵션이라던가 세부 설정 몇가지가 조금씩 달라 잘 안되는 경우가 있어, 후에 제가 다시 참고하기 위해 정리하고자 합니다.

> Host 환경 : windows 7  
Target환경 : windows XP SP3(vmware)  
vmware : VMware Workstation 7.01  
WinDbg : 6.12.0002( 낮은 버전에서는 windows 7을 지원 안할수도 있습니다)  

1. vmware에 설치한 XP에 시리얼 포트를 추가해줍니다.  
(이 시리얼 포트를 이용하여 windbg와 vmware가 통신합니다)
![img](/resource/2010/20101107/20101107-img-1.png)
![img](/resource/2010/20101107/20101107-img-2.png)
![img](/resource/2010/20101107/20101107-img-3.png)
![img](/resource/2010/20101107/20101107-img-4.png)
![img](/resource/2010/20101107/20101107-img-5.png)

2. Target의 부팅로더를 수정하여 디버거 모드로 부팅할수 있도록 합니다.  
XP에서는 boot.ini파일을 직접 수정하면 됩니다.  
![img](/resource/2010/20101107/20101107-img-7.png)  
boot.ini파일은 시스템 설정팡일로써 숨겨져 있으니 안보이시거든 폴더옵션에서 '보호된 파일 보이기'해주세요  
만약 boo.ini파일이 없으면  
![img](/resource/2010/20101107/20101107-img-8.png)  
![img](/resource/2010/20101107/20101107-img-9.png)  
하시면 boot.ini 파일 열립니다.  
[boot.ini]파일  
![img](/resource/2010/20101107/20101107-img-10.png)  
```
[boot loader]  
timeout=30  
default=multi(0)disk(0)rdisk(0)partition(1)\WINDOWS  
[operating systems]  
multi(0)disk(0)rdisk(0)partition(1)\WINDOWS="Microsoft Windows XP Professional" /noexecute=optin /fastdetect  
multi(0)disk(0)rdisk(0)partition(1)\WINDOWS="Microsoft Windows XP Professional - Debug" /fastdetect /debugport=com1 /baudrate=115200  
```
3. 설정 결과  
재부팅하시면 부팅시  
![img](/resource/2010/20101107/20101107-img-11.png)  
이렇게 뜨시면 성공.... vmware 셋팅은 끝났습니다.  

3. windbg 설정  
![img](/resource/2010/20101107/20101107-img-12.png)  
![img](/resource/2010/20101107/20101107-img-13.png)  
```
C:\WinDDK\7600.16385.1\Debuggers\windbg.exe -k com:port=\\.\pipe\com1,baud=115200,pipe,reconnect
```

---

이렇게 셋팅을 한후 실행시키면  
![img](/resource/2010/20101107/20101107-img-14.png)  
이렇게 연결이 되기를 기다리는 상태가 됩니다.  
이 상태에서 vmware에서 디버거 모드로 부팅시키면
![img](/resource/2010/20101107/20101107-img-15.png)  

이렇게 연결이 된것을 볼 수 있습니다.  