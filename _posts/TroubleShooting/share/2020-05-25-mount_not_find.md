---
layout: post
title: "Windows 명령프롬프트에서 공유폴더 Mount 시 안보임"
subtitle: "Mount를 성공하였는데, 탐색기에서 보이지 않음"
date: 2020-05-25 10:26:00+0900
categories: TroubleShooting
tags: CMD NFS Mount 관리자권한
mathjax: true
---

## 문제 현상
Windows10의 명령프롬프트에서 Mount를 정상적으로 수행하였는데, 윈도우 탐색기에 마운트된 드라이브가 보이지 않는 현상이 발생하였습니다.

![screen_1](/resource/NotFoundMountDriveFromCMD/CMD_Mount_Result.png)  
![screen_2](/resource/NotFoundMountDriveFromCMD/NotFoundNFSDrive.png)  


## 원인 분석
해당 현상은, 명령프롬프트를 관리자 권한으로 실행하였기 때문입니다.  
리눅스에서의 습관처럼 mount를 관리자 권한으로 실행하기 위해 명령프롬프트를 관리자 권한으로 실행하였고,  
관리자 권한의 명령프롬프트에서 mount를 실행 한 것입니다.  

윈도우 탐색기는 일반 권한(?)으로 실행되었기 때문에, 관리자 권한으로 마운트한 네트워크 드라이브가 보이지 않은 것입니다. 

## 문제 해결
Mount 일반 사용자도 사용 가능한 명령어이므로, 명령프롬프트를 관리자 권한이 아닌 일반 사용자로 실행하면 됩니다.  
