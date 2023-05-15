---
layout: post
title: "C#에서 Windows 레지스터리 이용하기"
date: 2010-08-05 14:27:00+0900
categories: C#
tags: Program C#
mathjax: true
---

# Write
```csharp
public static bool Register_Write(string o_key, string o_data)                             
{
    try
    {
        RegistryKey regkey;
        regkey = Registry.CurrentUser.OpenSubKey("Software", true);
        regkey.CreateSubKey(@"레지스트리 목록이름");//레지스트리 목록 생성
        regkey = Registry.CurrentUser.OpenSubKey(@"Software\Login", true);//생성한 레지스트리에 접근가능하도록 설정
        regkey.SetValue(o_key, o_data);//키 값과 데이터를 저장
        regkey.Close();
        return true;
    }
    catch
    {
        return false;
    }
}
```


# Read
```csharp
public static string Register_Read(string o_key)                                           
{
    string l_str;
    try
    {
        RegistryKey regkey;
        regkey = Registry.CurrentUser.OpenSubKey(@"Software\Login", true);//해당 레지스트리에 접근
        l_str = regkey.GetValue(o_key).ToString().Trim();//해당 키값에 대한 데이터를 저장
        regkey.Close();
        return l_str;//가져온 데이터를 반환
    }
    catch
    {
     return "";
    }
}
```