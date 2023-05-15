---
layout: post
title: "C#에서 GMap.Net 사용하기"
date: 2010-08-24 06:02:00+0900
categories: C#
tags: Program C# GMap.Net
mathjax: true
---

Google, Bing, Daum, Naver 등 많은 포털 사이트에서 Open Maps 서비스를 제공합니다.  
이러한 서비스를 제공하는 포털 사이트에서는 각각에 서비스에 맞춰  OpenAPI를 제공하는데 이러한 OpenAPI는 전주 익스플로러의 웹상에서 사용이 가능한 것이였기 때문에 C#과 같은 WinForms 에는 연동하기가 조금은 어려웠습니다.  
하지만 GMap.NET을 이용하면 굉장히 쉽게 연동할 수 있습니다.  

GMap.NET는 Open Source .Net Control으로써 몇개의 dll을 추가 참조함으로써 기존의 컨트롤들과 같이 쉽게 사용 할 수 있습니다.  

자세한 내용은 해당 웹 사이트를 이용하시기 바랍니다.  
http://greatmaps.codeplex.com/  
(라이브러리 형태뿐만 아니라 전체 데모 소스도 다운 받으실 수 있습니다)  


# GMap.Net 라이브러리 이용하기

1. 우선 솔루션 탐색기에서 참조 추가를 이용하여 GMap.Net라이브러를 참조 추가 합니다.
![img](/resource/20100824/20100824-img-1.png)
![img](/resource/20100824/20100824-img-2.png)  
라이브러리를 모두 추가합니다.
    - GMap.NET.Windows.Forms.dll
    - GMap.NET.Core.dll
    - GMap.Net.WindowsForms.dll
    - System.Data.SQLite.DLL  

2. 코드를 직접 입력해도 되지만 좀 더 편리하게 이용하기 위해 도구상자에 추가합니다
![img](/resource/20100824/20100824-img-3.png)  
찾아보기를 선택하여 GMap.Net.WindowsForms.dll를 추가하여 체크합니다.
![img](/resource/20100824/20100824-img-4.png)  

이렇게 하면
도구상자에서 기존의 컨트롤처럼 드래그하여 사용할 수 있습니다.

<br>


# 결과
![img](/resource/20100824/20100824-img-5.png)  