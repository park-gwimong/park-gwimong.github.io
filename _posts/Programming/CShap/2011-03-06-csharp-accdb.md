---
layout: post
title: "C#에서 accdb(Access2007) 연동하기"
date: 2011-03-06 21:01:00+0900
categories: C#
tags: Program C#
mathjax: true
---

Access2007부터 확장자가 accdb로 바뀌었습니다.
C#에서는 OleDB를 이용하여 연결하면 됩니다.

![img](/resource/2011/20110306/20110306-img-1.png)

<details>
<summary>접기/펼치기</summary>

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Data.OleDb;

namespace OleDb
{
    public partial class Form1 : Form
    {
        public OleDbConnection con;
        public OleDbCommand cmd;
        public String SQL;
        public Form1()
        {
            InitializeComponent();
           con = new OleDbConnection(@"Provider=Microsoft.ACE.OLEDB.12.0; Data Source=Database1.accdb;Mode=ReadWrite;");
            cmd = new OleDbCommand();
            cmd.Connection = con;
            cmd.CommandType = CommandType.Text;
            SQL = "SELECT * FROM [TableTest]";
            cmd.CommandText = SQL;
            con.Open();
            OleDbDataReader rd = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            while (rd.Read())
            {
                this.listView1.Items.Add(rd["Color"].ToString());
            }
            rd.Close();
        }
    }
}
```
</details>

![img](/resource/2011/20110306/20110306-img-2.png)