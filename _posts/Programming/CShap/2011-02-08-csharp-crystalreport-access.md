---
layout: post
title: "C#에서 CrystallReport 사용하기 #1"
date: 2011-02-08 17:48:00+0900
categories: C#
tags: Program C# Crystalreport
mathjax: true
---

CrystalReport로 데이터 전달하는 방법입니다.

<br>

1. CrystalReport에 Parameter Fields 추가  
![img](/resource/2011/20110208/20110208-img-2-1.png)  
![img](/resource/2011/20110208/20110208-img-2-2.png)  

2. 추가한 변수를 폼에 드래그하여 추가해줍니다.  
![img](/resource/2011/20110208/20110208-img-2-3.png)

3. Form에서 생성한 파라메터 변수로 데이터를 넘겨줍니다.  
crDocz.SetParameterValue("Data1", "데이터를 넘기자!!");  
//SetParameterValue("Parameter Fields 이름", "넘길 데이터")

> Tip. 만약 데이터를 넘겨주지 않고 실행하면 출력창이 뜨면서 데이터를 입력하라는 창이 나옵니다.  
그리고 데어터를 넘겨줄때와 넘겨주지 않을때가 있어서 넘겨주지 않을 경우 해당 필드가 출력창에 나오지 않기를 원하는 경우 SetParameterValue("Parameter Fields 이름", "") 이렇게 해주면됩니다.

4. 결과
![img](/resource/2011/20110208/20110208-img-2-4.png)