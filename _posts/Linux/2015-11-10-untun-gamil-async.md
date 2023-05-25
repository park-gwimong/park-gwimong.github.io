---
layout: post
title: "Ubuntu 전자우편 클라이언트에서 gmail 연동하기"
date: 2015-11-10 13:33:00+0900
categories: Linux
tags: Ubuntu Gmail
mathjax: true
---

Thunderbird, Evolution 등 전자우편 클라이언트를 통해 기존의 사용하던 전자우편 서비스를 이용할 수 있습니다.

전자우편 클라이언트에 IMAP/SMTP 등을 설정하는데 몇 가지 주의해야 할 부분들이 있어 정리합니다.

<br>

# 기본 설정
1. 사용하고 있는 메일 서비스 업체에서 IMAP와 SMTP 서비스를 제공하는지 확인하고 해당 계정에서 사용 할 수 있도록 설정.
![img](/resource/2015/20151110/20151110-gmail-async-1.png)

2. 전자우편 클라이언트 설정
![img](/resource/2015/20151110/20151110-gmail-async-2.png)
참고 : https://support.google.com/mail/troubleshooter/1668960?hl=ko&rd=2#ts=1665018%2C1665141%2C2769074

<br>

# 2차 인증 설정
전자우편의 비밀번호를 입력하면 비밀번호가 맞지 않다며 접속이 되지 않는 경우가 있습니다.  
구글 계정에서 다른 장치에서 접근하는 것을 관리하기 위해 앱 비밀번호라는 것을 사용합니다.

예전에는 전자우편 클라이언트에서 사용하던 전자우편 계정의 비밀번호를 사용할 수 있었는데, 최근에는 2차 인증 비밀번호를 입력해야 합니다.

> 참고 : https://support.google.com/accounts/answer/185833

2차 인증 설정하는 메뉴가 보이지 않는 경우가 있습니다.  
그럴 경우 url로 접속을 하라고 합니다.  
> url : https://www.google.com/intl/ko/landing/2step/

구글 계정으로 로그인 후 2차 인증을 설정합니다.  
하단에 기기와 앱을 설정 한 후 생성 버튼을 클릭하면 16자리의 코드가 생성되는데 이 코드가 비밀번호가 생성 됩니다.  
![img](/resource/2015/20151110/20151110-gmail-async-3.png)  
위 코드를 비밀번호 창에 입력하면 됩니다.  
