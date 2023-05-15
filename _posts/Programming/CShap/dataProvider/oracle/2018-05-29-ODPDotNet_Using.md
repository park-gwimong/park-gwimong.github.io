---
layout: post
title: "ODP.NET을 사용하여 Oracle에 연동(C#)"
date: 2018-05-29 16:43:00+0900
categories: Programming
tags: OracleDB .NET C# VisualStudio
mathjax: true
---

Using ODP.NET
======================

## Getting Started with ODP.NET

1. C# 프로젝트 생성

2. 참조에 OracleManagedDataAccess 추가   
	![AddReference](/resource/ODPDotNet/ODPDotNet_AddReference.png "AddReference"){: width="700" height="400"}

3. using 코드 추가
```c#
using Oracle.ManagedDataAccess.Client;
```

4. 예제(CRUD) 코드
```c#
string serverAddress = "localhost";
string serviceName = "ORCL";
string userId = "scott";
string userPw = "000000";
string connectStr = string.Format("Data Source=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST={0})(PORT=1521))(CONNECT_DATA=(SERVICE_NAME={1})));User Id={2};Password={3};", serverAddress, serviceName, userId, userPw);
using (OracleConnection cnn = new OracleConnection(connectStr))
{
	cnn.Open();

	/*************************** Create *************************************/
	OracleCommand insertCmd = new OracleCommand();
	insertCmd.Connection = cnn;
	insertCmd.CommandText = "INSERT INTO USERS(ID, USERNAME) VALUES (:id, :NAME)";

	insertCmd.Parameters.Add("ID", OracleDbType.Int32);
	insertCmd.Parameters.Add("USERNAME", OracleDbType.Varchar2, 50);

	insertCmd.Parameters[0].Value = 1;
	insertCmd.Parameters[1].Value = "test";

	int affected = insertCmd.ExecuteNonQuery();
	Console.WriteLine("# Result : " + affected);


	/*************************** Read *************************************/
	// Select - ExecuteScalar
	OracleCommand selectCmd = new OracleCommand();
	selectCmd.Connection = cnn;
	selectCmd.CommandText = "SELECT USERNAME FROM USERS WHERE ID=1";

	object result = selectCmd.ExecuteScalar();
	Console.WriteLine("# Result : " + result);

	// Select - DataTable
	DataSet ds = new DataSet();
	OracleDataAdapter da = new OracleDataAdapter("SELECT * FROM USERS", cnn);
	da.Fill(ds, "USERS");

	DataTable dt = ds.Tables["USERS"];
	foreach (DataRow dr in dt.Rows)
	{
		Console.WriteLine(string.Format("ID = {0}, USERNAME = {1}", dr["ID"], dr["USERNAME"]));
	}

	/*************************** Update *************************************/
	OracleCommand updateCmd = new OracleCommand();
	updateCmd.Connection = cnn;
	updateCmd.CommandText = "UPDATE USERS SET USERNAME = :USERNAME WHERE ID = :ID";

	updateCmd.Parameters.Add("USERNAME", OracleDbType.Varchar2, 150);
	updateCmd.Parameters.Add("ID", OracleDbType.Int32);

	updateCmd.Parameters[0].Value = "test2";
	updateCmd.Parameters[1].Value = 1;

	affected = updateCmd.ExecuteNonQuery();
	Console.WriteLine("# Result : " + affected);

	/*************************** Delete *************************************/
	OracleCommand deleteCmd = new OracleCommand();
	deleteCmd.Connection = cnn;
	deleteCmd.CommandText = "DELETE FROM USERS WHERE ID = :ID";

	deleteCmd.Parameters.Add("ID", OracleDbType.Int32);
	deleteCmd.Parameters[0].Value = 1;

	affected = deleteCmd.ExecuteNonQuery();
	Console.WriteLine("# Result : " + affected);
}
```
[[전체소스]](https://github.com/gwimong/exampleCode/tree/master/dotNetDataProvider/oracle/ODPDotNet/OracleDBTest)

## Using ODP.NET with Oracle Developer Tools for Visual Studio

1. 서버 탐색기 -  연결 추가 클릭   
![ODPDotNet_ODT1](/resource/ODPDotNet/ODPDotNet_ODT_Using1.png "ODPDotNet_ODT1")

2. 데이터 소스 변경 - Oracle 데이터베이스 - ODP.NET, 관리되는 드라이버 선택
![ODPDotNet_ODT2](/resource/ODPDotNet/ODPDotNet_ODT_Using2.png "ODPDotNet_ODT2")

3. 연결 정보 입력   
![ODPDotNet_ODT3](/resource/ODPDotNet/ODPDotNet_ODT_Using3.png "ODPDotNet_ODT3")

4. 데이터 연결 확인   
![ODPDotNet_ODT3](/resource/ODPDotNet/ODPDotNet_ODT_Using4.png "ODPDotNet_ODT4")



## 참고
<http://www.oracle.com/webfolder/technetwork/tutorials/obe/db/12c/r1/appdev/dotnet/Web_version_Fully_Managed_ODPnet_OBE/odpnetmngdrv.html>
