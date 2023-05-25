---
layout: post
title: "C#에서 CrystallReport 사용하기 #2"
date: 2011-02-08 13:04:00+0900
categories: C#
tags: Program C# Crystalreport
mathjax: true
---

mdb 파일을 이용하여 데이터를 표로 출력하는 방법입니다.

<br>

# 보고서 마법사를 이용하여 생성
![img](/resource/2011/20110208/20110208-img-1.png)
![img](/resource/2011/20110208/20110208-img-2.png)
mdb파일을 추가합니다.  
![img](/resource/2011/20110208/20110208-img-3.png)

필요한 필드를 추가해 줍니다.  
![img](/resource/2011/20110208/20110208-img-4.png)  

# 보고서 결과
![img](/resource/2011/20110208/20110208-img-5.png)  
Tip: 위의 그림에서 빨간색으로 표시한 Main Report Preview를 클릭하면 결과를 미리 볼수 있습니다.

![img](/resource/2011/20110208/20110208-img-6.png)  
기본적으로 Save data in the report 가 체크되어 있는데 이부분은 해제합니다.
만약 계속 체크되어 있으면 데이터가 계속 저장되어있어서 mdb에서 데이터를 수정해도 보고서에는 적용되지 않을수도 있습니다.