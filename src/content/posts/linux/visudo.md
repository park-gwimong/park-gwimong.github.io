---
title: "sudo 권한 부여하기"
subtitle: "visudo를 사용하자"
pubDate: 2020-03-09T18:19:00+09:00
category: "linux"
math: true
---

===


# What?
: Edit the sudoers file  
sudoers 파일을 수정하기 위한 유틸리티입니다. 


# Why? 
sudo 권한은 일반 유저에게 root 권한을 부여하는 것입니다.
sudo 권한을 부여하기 위해서는 sudoers 파일을 수정해야 하는데, 그만큼 중요한 파일이기에 파일 권한이 잠겨 있습니다.  

![sudoers](/resource/2020/20200309/sudoers.png)

다른 계정은 읽지도 못하며, 소유자인 root도 읽기만 가능합니다.  
그렇기에 sudo 권한을 부여하기 위해선   
  - 


