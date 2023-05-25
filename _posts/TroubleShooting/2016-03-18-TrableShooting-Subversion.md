---
layout: post
title: "The path '.' appears to be part of a Subversion 1.7 or greater working copy"
date: 2016-03-18 09:40:00+0900
categories: TrablleShooting
tags: SVN
mathjax: true
---

기존에 사용하던 SVN을 다시 사용하려고 실행하는데 다음과 같은 에러가 떴습니다.

이는 SVN 버전에 따라 디렉토리 구조를 다르게 인식하는것 때문인것 같습니다.
![error](/resource/2016/20160318/20160318-svn-error1.png)  


현재 시스템의 SVN 버전은 아래와 같습니다.  
![error](/resource/2016/20160318/20160318-svn-error2.png)


SVN  버전을 업그레이드 하면 해결됩니다.
```shell
$yum update subversion
```