---
layout: post
title: ".NET에서 Oracle 연동"
date: 2018-05-24 18:43:00+0900
categories: Programming
tags: OracleDB .NET
mathjax: true
---

.NET Framework Data Provider
======================
.NET Framework 데이터 공급자는 Database에 연결하고 명령을 실행하며 그 결과를 검색하는데 사용됩니다.

![attack type](/resource/DotNetFrameworkProvider.png ".NET Framework Data Provider")

## .NET Framework Data Provider for ODBC
ODBC(Open DataBase Connectivity)는 Database에 접근하기 위해 Microsoft가 만든 소프트웨어 표준 규격입니다.   
네이티브 ODBC DM(드라이버 관리자)을 사용하여 Oracle 데이터 소스에 연결합니다.

* (Microsoft) ODBC Provider for Oracle Driver :
	- Microsoft에서 제공하는 Oracle ODBC Driver
	- Oracle 데이터 소스에 ODBC 호환 응용 프로그램을 연결
	- 이 후 Winodws에서 제거될 예정이므로 Oracle에서 제공하는 ODBC Driver 이용 권장
	- 참고1 : <https://docs.microsoft.com/ko-kr/sql/odbc/microsoft/odbc-driver-for-oracle?view=sql-server-2017>
	- 참고2 : <https://support.microsoft.com/ko-kr/help/310988/how-to-use-the-odbc-net-managed-provider-in-visual-c-net-and-connectio>
* (Oracle) ODBC Provider for Oracle Driver :
	- Oracle에서 제공하는 Oracle ODBC Driver
	- Oracle 데이터 소스에 ODBC 호환 응용 프로그램을 연결
	- Oracle 11g부터 ODBC Driver 제공하지 않음
	- ODBC Driver Download : <http://www.oracle.com/technetwork/database/windows/downloads/utilsoft-098155.html>

## .NET Framework Data Provider for OLE DB
OLE DB(Object Linking and Embedding, Database)는 여러 종류의 저장된 데이터에 접근하기 위해 Microsoft가 만든 API입니다.  
스프레드시트와 같이 더 다양한 범위의 비관계형 Database를 지원하기 위해 기능을 확장하였습니다.

* (Microsoft) OLE DB Provider for Oracle :
	- Microsoft에서 제공하는 OLE DB Provider for Oracle
	- ADO를 Oracle 데이터 소스에 연결
	- 이 후 Winodws에서 제거될 예정이므로 Oracle에서 제공하는 OLE DB Provider 이용 권장
	- Provider : MSDAORA.1
	- 참고 : <https://docs.microsoft.com/ko-kr/sql/ado/guide/appendixes/microsoft-ole-db-provider-for-oracle?view=sql-server-2017>
* (Oracle) OLE DB Provider for Oracle :
	- Oracle에서 제공하는 OLE DB Provider for Oracle
	- ADO를 Oracle 데이터 소스에 연결
	- Provider : OraOLEDB.Oracle
	- 참고 : <https://www.connectionstrings.com/oracle-provider-for-ole-db-oraoledb/>

## .NET Framework Data Provider for Oracle
Oracle 클라이언트 연결 소프트웨어를 통해 Oracle 데이터 소스에 연결합니다.
	
- Mocrosoft에서 제공하는 Oracle용 .NET Native Data Provider
- 시스템에 Oracle 클라이언트 8.1.7 이상 버전이 설치 되어 있어야 함
- Oracle 7.3, 8i, 9i 또는 10g에 연결
- 이 공급자는 더 이상 사용되지 않음

## ODP.NET
Oracle Data Provider for .NET(ODP.NET)은 Oracle Database에 최적화 된 ADO.NET 데이터 연결 기능을 제공합니다.

- Oracle사에서 제공하는 .NET Native Data Provider
-	Oracle Database에서 제공하는 모든 데이터 타입을 지원
- ODAC(Oracle Data Access Components) for Visual Studio 2013~2017에 포함되어 있음
