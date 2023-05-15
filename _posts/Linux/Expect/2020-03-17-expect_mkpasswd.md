---
layout: post
title: "Expect Tools 활용 - expect_mkpasswd"
date: 2020-03-17 11:00:00+0900
categories: Linux
tags: Expect Utility
mathjax: true
---

# 소개
: generate new password, optionally apply it to a user  
비밀번호를 생성하여 사용자 계정에 자동으로 적용합니다.[[원문]](https://helpmanual.io/man1/expect_mkpasswd)

# 사용법
- 비밀번호 생성하기
> 아무런 매개 변수가 없으면 단순히 비밀번호를 생성하고 이를 표출합니다.
```bash
#expect_mkpassword
```
- 비빌번호를 생성하고 이를 계정에 적용  
> 사용자 계정명을 매개변수로 전달하면, 비밀번호를 생성하고, 이를 해당 계정에 적용합니다.
```bash
#expect_mkpassword [userId]
```

# 옵션
  - -l : 비밀번호 길이. (기본값 : 9)
	- -d : 비밀번호 최소 길이. (기본값: 2)
	- -c : 비밀번호에 포함되어야 하는 최소 영문 소문자 수(기본값: 2)
	- -C : 비밀번호에 포함되어야 하는 최소 영문 대문자 수(기본값: 2)
	- -s : 비밀번호에 포함되어야 하는 최소 특수 문자 수(기본값 : 1)
	- -p : 사용할 프로그램(기본적으로 /etc/ypasswd가 있으면 사용되며, 없는 경우 /bin/passwd가 사용)
	- -2 : 비밀번호가 좀 더 알아보기 힘듬
	- -v : 비밀번호 보여주기

# 예시
>
```bash
#expect_mkpasswd -l 15 -d 3 -c 3 -C 3 -s 3
```
