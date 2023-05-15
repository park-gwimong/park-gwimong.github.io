---
layout: post
title: "Expect로 다수의 서버를 관리하자(2)"
subtitle: "Perl로 Expect 구현하기"
date: 2020-03-12 14:00:00+0900
categories: Linux
tags: Expect Perl Utility Script Programming
mathjax: true
---

Expect는 기본적으로 tcl로 작성됩니다. 하지만 tcl는 그리 친숙한 언어가 아니죠...
expect는 다양한 언어에 모듈 형태로 지원되는데, 그중에 그나마 친숙한 perl로 expect를 사용하는 방법입니다.

# Perl 설치
리눅스에 기본적으로 perl이 설치되어 있겠지만, 혹여나 설치가 되어 있지 않다면 yum이나 apt로 설치합니다.
```bash
#sudo apt install perl
```

# Perl expect 설치
Perl는 모듈 관리를 위해 cpan을 이용합니다.  

1. cpan 설치
```bash
#sudo install cpan
```
2. cpan으로 perl expect 모듈 설치
```bash
#sudo cpan expect
```

# 예제 코드

#### Expect로 구현 - SSH 로그인
```bash
#!/usr/bin/expect -f

proc usage {} {
  puts "usage: ip_address password"
  exit 1
}

proc login { host user password } {
  puts "Connect server...\n"
  spawn ssh $user@$host
  expect {
    -re "No route" { exit 1 }
    -re "try again" { exit 1 }
    -re "yes/no" { send "yes\r"; exp_continue }
    -re "password:" { send "$password\r"; }
  }
  send "exit";
}

set timeout -1
set HOST [lindex $argv 0]
set USERID [lindex $argv 1]
set PASSWD [lindex $argv 2]
set argc [llength $argv]

if { [llength $argv] != 3 } {
  usage
}

set running [login $HOST $USERID $PASSWD ]

exit 0
```
[[전체 소스]](https://github.com/gwimong/exampleCode/blob/master/expect/sshConnect.exp)

#### Perl Expect 로 구현 - SSH 로그인
```bash
#!/usr/bin/env perl

use strict;
use warnings;
use Expect;

my $host = $ARGV[0];
my $userid   = $ARGV[1];
my $userpass = $ARGV[2];

my $exp = Expect->new;
$exp->spawn("ssh", $userid . "@" . $host);
$exp->expect(
    10,
    [ qr/(yes\/no)/   => sub { my $exp = shift; $exp->send("yes\n"); exp_continue; } ],
    [ qr/password:/   => sub { my $exp = shift; $exp->send($userpass."\n"); exp_continue; } ],
    [ qr/$userid.*\$/ => sub { my $exp = shift; $exp->send("ls > ls.txt\n");} ],
    [ qr/Password:/   => sub { my $exp = shift; $exp->send($userpass."\n"); exp_continue; } ],
    [ qr/root.*#/     => sub { my $exp = shift; $exp->interact(); } ],
);

print "$0 exit\n";
```
[[전체 소스]](https://github.com/gwimong/exampleCode/blob/master/expect/sshConnect.pl)
