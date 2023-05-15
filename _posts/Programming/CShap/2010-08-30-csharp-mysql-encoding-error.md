---
layout: post
title: "C#에서 Mysql 데이터 받아올 때 한글 깨짐 현상"
date: 2010-08-30 00:38:00+0900
categories: C#
tags: Program C# Mysql
mathjax: true
---

MySQL에서 한글로 된 데이터를 바로 받아오면 한글이 깨져서 날라오는 경우가 있습니다.  
인코딩 형식이 다르기 때문인데, MySql서버와 닷넷에서의 인코딩 환경을 같게 해주면 될것 같은데 잘 안되더군요  
그래서 그냥 byte로 받아온다음에 이를 다시 string 로 변환해주는 방법으로 해결하였습니다.  

```csharp
string query = "select * from CostomUser";//적용시킬 쿼리문
            byte[] data_query = Encoding.Default.GetBytes(query);

            MySqlCommand cmd = new MySqlCommand(Encoding.GetEncoding("ISO-8859-1").GetString(data_query));
            cmd.Connection = Loginconn;
            Loginconn.Open();
            MySqlDataReader reader = cmd.ExecuteReader();
            try
            {
                while (reader.Read())//데이터베이스의 값 불러오기
                {
                    byte[] data = Encoding.GetEncoding("ISO-8859-1").GetBytes(reader.GetString(1));
                    string str = Encoding.Default.GetString(data);

                    listView1.Items.Add(str);//Getstring(n) : n번째 컬럼 값           
                }
            }
            catch
            {
                MessageBox.Show("연결 실패 했지롱");
            }
            Loginconn.Close();
```
