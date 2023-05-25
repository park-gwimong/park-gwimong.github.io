---
layout: post
title: "Windows 기본 프로세스 정리"
date: 2011-08-25 00:01:00+0900
categories: System
tags: os Windows Process
mathjax: true
---

Visual Studio를 깔아놓으니까 먼 충돌을 이리 많이 일으키는지..
툭하면 오류나서 디버깅할거냐고 물어보고 해서 제 컴터에서 기본적으로 필요한 프로세스에 대해서 정리 한번 해놓고자 합니다.

## alg.exe
주로 방화벽이나 보안과 관련되어 실행되기 때문에 간단하게 말하자면 방확벽 프로세스라고 할 수 있습니다. 다른 응용프로그램들이 클라이언트에서 서버로 포트 통신을 할 때, 수동 TCP/UDP 포트를 동적으로 사용 할 수 있도록 해주는 역확을 합니다.

---

## taskmgr.exe
Windows 작업 관리자 프로세스입니다.  

---

## igfxpers.exe
인텔 그래픽 관련 프로세스 입니다.

---

## hkcmdexe
인텔 그래픽 관련 소프트웨어를 설치하면 실행되는 단축기 관련 프로세스입니다.  

---

## tp4mon.exe
레노버 ThinkPad 제품에서 실행되는 프로세스입니다. 소위 말하는 '빨콩(TrackPoint)'을 위한 프로세스입니다.  

---

## spoolsv.exe
프린트 관련 프로세스입니다. 컴퓨터와 프린트 사이의 데이터 전송 속도의 차이를 해결하기 위한 스풀 기능을 위한 프로세스입니다.  

---

## svchost.exe
Microsoft Service Host Process로써 DLL로 실행되는 프로세스들을 그룹화 하는데 사용됩니다.  

---

## uphclean.exe
유저 정보를 정리해주는 프로세스입니다.  

---

## mDNSResponder.exe
아도비사에 만든 "Bonjour"서비스라고 하네요. 아도비사 프로그램을 설치하면 자동으로 실행되는 프로세스입니다.  
제거하는 자세한 방법 :  http://badnom.com/139

---

## sqlwriter.exe
마이크로소프트 SQL Sever 응용프로그램입니다.  
제거하는 제사한 방법 :  http://www.windowexe.com/bbs/board.php?bo_table=board01_s&wr_id=383

---

## npkcmsvc.exe
nProtect사의 키보드 보안 프로그램입니다. 평소에는 아무일도 하지 않고 가만히 있다가 키보드 보안이 필요할때 실행되는 프로세스입니다.  
게임이나 인터넷 뱅킹하시다보면 자동으로 설치되는 프로그램입니다.

---

## IMEDICTUPDATE.exe
마이크로소프트사에서 제공하는 다국어 문자입력 서비스입니다.  

---

## ibmpmsvc.exe
IBM 노트북에서 사용되는 파워관련 프로세스입니다.  

---

## isass.exe
윈도우 로그온시 계정과 윈도우의 보안정책을 연결시켜주는 연확을 합니다.  

---

## services.exe
시스템 서비스의 시작, 중지 및 시스템 서비스와의 상호 작용을 담당하는 서비스 제어 관리자입니다.  

---

## winlogon.exe
로그인 관리자로 로그인과 로그아웃을 처리합니다.  

---

## csrss.exe
Clinet/Server Run-time SubSystem의 약어로써  콘솔 윈도우, 쓰레드의 생성/삭제, 16비트 가상 머신의 처리를 담당합니다.  
이 프로세스는 강제로 종료할 수 없기때문에 문제가 생기면 조금 골치가 아픕니다.  
문제가 생겼을 경우 : http://blog.naver.com/aoobc?Redirect=Log&logNo=70084948457 

---

## smss.exe
Session Manager SubSystem의 약어로써 사용자 세션을 위한 프로세스입니다.  
문제가 생겼을 경우 : http://blog.naver.com/aoobc?Redirect=Log&logNo=70084948457 

---

## wuauclt.exe
윈도우 업데이트 관련 프로세스입니다.

---

## natsvc.exe
그리드 방식으로 데이터를 업로드 시키는 프로세스입니다. 주로 p2p나 웹하드에 접속시 사용되는 프로세스입니다.  
하드디스크에 무리를 많이 주는 프로세스이므로 사용하지 않는 경우 종료시켜놓는게 좋습니다.  

---

## wscntfy.exe
MS에서 제공하는 윈도우 보안센터 풍선 도움말 프로세스입니다.  

---

# ctfmon.exe
고급 입력 서비스 프로세스입니다. 거의 사용되지 않는 프로세스입니다.
제거하는 자세한 방법 :  http://qaos.com/article.php?sid=1362
