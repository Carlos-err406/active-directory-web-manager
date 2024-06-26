FROM ubuntu:focal

# samba version from https://download.samba.org/pub/samba/stable/
ARG samba_version=4.16.7
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get -y install acl dialog apt-utils attr autoconf bind9utils binutils bison build-essential ccache chrpath curl debhelper dnsutils docbook-xml docbook-xsl flex gcc gdb git glusterfs-common gzip heimdal-multidev hostname htop krb5-config krb5-kdc krb5-user language-pack-en lcov libacl1-dev libarchive-dev libattr1-dev libavahi-common-dev libblkid-dev libbsd-dev libcap-dev libcephfs-dev libcups2-dev libdbus-1-dev libglib2.0-dev libgnutls28-dev libgpgme11-dev libicu-dev libjansson-dev libjs-jquery libjson-perl libkrb5-dev libldap2-dev liblmdb-dev libncurses5-dev libpam0g-dev libparse-yapp-perl libpcap-dev libpopt-dev libreadline-dev libsystemd-dev libtasn1-bin libtasn1-dev libtracker-sparql-2.0-dev libunwind-dev lmdb-utils locales lsb-release make mawk mingw-w64 patch perl perl-modules pkg-config procps psmisc python3 python3-cryptography python3-dbg python3-dev python3-dnspython python3-gpg python3-iso8601 python3-markdown python3-matplotlib python3-pexpect python3-pyasn1 python3-setproctitle rng-tools rsync sed sudo tar tree uuid-dev wget xfslibs-dev xsltproc zlib1g-dev

RUN wget https://download.samba.org/pub/samba/stable/samba-${samba_version}.tar.gz && \
    tar xzvf samba-${samba_version}.tar.gz && \
    cd samba-${samba_version} && \
    ./configure --prefix=/usr/local/samba --enable-selftest --sysconfdir=/etc/samba --with-ldap --with-shared-modules='!vfs_snapper' --with-ads --with-winbind && \
    make -j4 && \
    make install

ENV PATH=/usr/local/samba/bin:/usr/local/samba/sbin:$PATH

VOLUME ["/var/lib/samba", "/etc/samba"]

ADD samba.docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["samba"]
