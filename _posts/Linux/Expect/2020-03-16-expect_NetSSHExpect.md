---
layout: post
title: "Expect로 다수의 서버를 관리하자(3)"
subtitle: "Perl로 Expect 모듈 - NetSSHExpect"
date: 2020-03-16 14:00:00+0900
categories: Linux
tags: Expect Perl Utility NetSSHExpect Script Programming
mathjax: true
---


Perl Expect의 다양항 모듈 중 SSH 로그인을 위한 모듈을 소개드립니다.  
간단하게 SSH 로그인하여 원격으로 명령을 수행하는 스크립트를 구현 할 수 있습니다.

# Net::SSH:Expect
: SSH wrapper to execute remote commands  
SSH를 이용한 원격 명령 실행 모듈입니다.[[출처]](https://metacpan.org/pod/distribution/Net-SSH-Expect/lib/Net/SSH/Expect.pod)

## Install
cpan을 이용하여 설치합니다.
```bash
# sudo cpan Net::SSH::Expect
```

## 예제
```bash
#!/usr/bin/perl
use Net::SSH::Expect;

my $ssh = Net::SSH::Expect->new (
	 host => "localhost",
	 password=> 'test123',
	 user => 'test',
	 raw_pty => 1
  );

my $login_output = $ssh->login();
print ($login_output);

if ($login_output !~ /Welcome/) {
	die "Login has failed. Login output was $login_output";
}

my $who = $ssh->exec("who");
print ($who);

my $line;
  while ( defined ($line = $ssh->read_line()) ) {
  print $line . "\n";
}

print $ssh->peek(0);    # you'll probably see the remote prompt
$ssh->eat($ssh->peek(0));  # removes whatever is on the input stream now

my $chunk;
	while ($chunk = $ssh->peek(1)) { # grabs chunks of output each 1 second
	print $ssh->eat($chunk);
}

$ssh->close();
```
