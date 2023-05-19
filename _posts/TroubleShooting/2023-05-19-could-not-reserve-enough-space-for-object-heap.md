---
layout: post
title: "vsfpt에서 파일 업로드가 되지 않는 현상"
subtitle: "553 Could not create file."
date: 2010-11-07 17:35:00+0900
categories: TroubleShooting
tags: vsftp linux
mathjax: true
---

# 장애 현상
Spring boot project를 내장 톰캣으로 실행시킬 때 아래의 오류가 발생함.  
> Error occurred during initialization of VM  
Could not reserve enough space for 2097152KB object heap


# 해결 과정
해당 오류는 프로젝트 실행 시 heap 메모리가 부족하다는 오류입니다.

1. Intellij의 heap 메모리 설정
> Help > Change Memory Settings  

2. Java VM 옵션 추가
> -Xms1024m -Xmx2048m  

3. __JDK 변경__  
JDK 1.8(64bit)를 추가로 설치하고, 실행 시 해당 JDK로 실행되도록 변경 


# 원인 분석

> The maximum theoretical heap limit for the 32-bit JVM is 4G.   
> Due to various additional constraints such as available swap, kernel address space usage, memory fragmentation, and VM overhead, in practice the limit can be much lower.  
> __On most modern 32-bit Windows systems the maximum heap size will range from 1.4G to 1.6G.__ On 32-bit Solaris kernels the address space is limited to 2G. On 64-bit operating systems running the 32-bit VM, the max heap size can be higher, approaching 4G on many Solaris systems.

32bit JVM은 이론상 최대 4GB의 메모리를 사용 할 수 있지만, Windows 환경에선 2GB로 제한됩니다.
이로 인해 2GB 이상의 프로젝트를 실행 할때 해당 오류가 발생 한 것입니다.

