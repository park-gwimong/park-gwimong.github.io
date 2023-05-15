---
layout: post
title: "ODP.NET 설치"
date: 2018-05-29 02:43:00+0900
categories: Programming
tags: OracleDB .NET C# VisualStudio
mathjax: true
---

ODP.NET Install
======================


ODP.NET을 사용하기 위해서는 OracleManagedDataAccess.dll을 참조에 추가하면 된다.   
관련 라이브러리들을 직접 다운로드 받아 추가하여도 되지만, Nuget을 이용하거나 ODT(Oracle Developer Tools) for Visual Studio를 설치하는 것을 권장한다.
(ODAC로는 테스트를 해보지 않았음)


## Nuget을 이용하여 설치하는 방법

1. 솔루션 탐색기에서 참조 또는 프로젝트를 선택 -> 오른쪽 단추 클릭 하고 NuGet 패키지 관리..클릭   
	![NuGet Package Manager](/resource/ODPDotNet/ODPDotNet_NuGet0.png "ODPDotNet_NuGet0"){: width="300" height="300"}

2. 찾아보기 - ODP.NET 검색하여 설치 클릭   
	![NuGet Package Manager](/resource/ODPDotNet/ODPDotNet_NuGet1.png "ODPDotNet_NuGet1"){: width="700" height="400"}

3. 라이센스 동의 버튼 클릭   
	![ODPDotNet_NuGet2](/resource/ODPDotNet/ODPDotNet_NuGet2.png "ODPDotNet_NuGet2"){: width="700" height="400"}

4. 설치 완료   
	![ODPDotNet_NuGet3](/resource/ODPDotNet/ODPDotNet_NuGet3.png "ODPDotNet_NuGet3"){: width="700" height="400"}


## Oracle Developer Tools for Visual Studio 201x - MSI Installer을 이용하여 설치하는 방법
* Download : <http://www.oracle.com/technetwork/topics/dotnet/downloads>
* Download includes :
	- Oracle Developer Tools for Visual Studio
	- <b>Oracle Data Provider for .NET, Managed Driver</b>
	- Oracle Providers for ASP.NET

## ODAC(Oracle Data Access Components)을 이용하여 설치하는 방법
* Download : <http://www.oracle.com/technetwork/topics/dotnet/utilsoft-086879.html>   
* Download includes :
	- Oracle Developer Tools for Visual Studio
	- <b>Oracle Data Provider for .NET</b>
	- Oracle Providers for ASp.NET
	- Oracle Providers for ASp.NET
	- Oracle Data Provider for .NET Oracle TimesTen In-Memory Database
	- Oracle Services for Microsoft Transaction Server
	- Oracle ODBC Driver
	- Oracle SQL*Plus
	- Oracle Instant Client


