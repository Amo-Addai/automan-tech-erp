import sys, time
#
from AutoAuditingSleeperApp import getApp

# STEP 0 - CREATE A SMALL SAMPLE PROGRAM TO RUN A CLI COMMAND & PARSE DATASET (ALL NECESSARY LOG FILES) INTO JSON AND SEND A SINGLE LOG TO Auto-API
# STEP 1 - CREATE PROGRAM FRAMEWORK, RECEIVING ALL ARGUMENTS FROM Auto-API CLI/RPC CALL, & LINKING IT TO STEP 0'S PROGRAM
# STEP 2 - EXPAND PROGRAM INTO MULTIPLE SECTIONS (BASED ON SOURCES/TOOLS) GENERICALLY
# STEP 3 - IMPLEMENT PERFORMING AUTOAUDITS & HANDLER ACTIONS (COMMANDS USING SOURCES/TOOLS)
# STEP 4 - IMPLEMENT MONITORING (FOR ALL AUTOAUDITS & HANDLER ACTIONS, PERFORMED BY ALL SOURCES/TOOLS) - PREPROCESS ALL NECESSARY LOG FILES

'''         http://www.secrepo.com/ TO GET THE NETWORK LOGS DATASETS
        BRO
1. Network Connection Tracking : conn.log (TCP/UDP/ICMP connections); http.log (HTTP requests and replies); 
                                ssh.log (SSH connections); ftp.log, smtp.log, dhcp.log, dns.log, ^snmp.log,
                                
NB: ***** Network Observations : known_certs.log (SSL certificates); known_devices.log (MAC addresses of devices on the network); 
    known_hosts.log	(Hosts that have completed TCP handshakes); known_services.log (Services running on hosts); software.log (Software being used on the network);

2. File System Monitoring : files.log (File analysis results); 

3. Intrusion Detection : signatures.log (Signature matches); notice.log (Bro notices); *notice_alarm.log (The alarm stream); *intel.log (Intelligence data matches); *traceroute.log (Traceroute detection)

'''

'''         
        OSSEC
1. Intrusion Detection : 

'''

'''         
        KISMET
1. Intrusion Detection : 

'''

'''         
        LYNIS
1. System Auditing : 

'''


def main():  # GET CLI ARGUMENTS, THEN INSTANTIATE AutoAuditingSleeperApp
    params = sys.argv
    # params = '{"access_token":"token","settings":{"autoaudit":"Network Connection Tracking","sources":{"Bro":{}}}}'
    print("")
    print("")
    print("PARAMS -> " + str(params))
    if params is not None:
        app = getApp().setup(params)
        if app is not None:
            app.start()
        else:
            print("Invalid parameters, AutoAuditingSleeper cannot run")

if __name__ == '__main__':
    main()
