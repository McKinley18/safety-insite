# §314 rig reset — disposable state only. Truncates the rig database and empties the rig bucket so
# every suite run starts from the same place and is repeatable.
docker exec s314-pg psql -U postgres -d idemtest -q -c "truncate storage_objects, security_audit_events, inspection_report_versions, inspection_reports, observations, inspection, site, agreement_acceptances, refresh_tokens, notifications, organization_memberships, entitlement_grants, inspection_assignments, audit_logs restart identity cascade; delete from \"user\";" >/dev/null 2>&1
node -e '
module.paths.unshift("/Users/mckinley/Desktop/Safety_InSite/backend/node_modules");
const {S3Client,ListObjectsV2Command,DeleteObjectCommand}=require("@aws-sdk/client-s3");
const c=new S3Client({region:"auto",endpoint:"http://127.0.0.1:19030",forcePathStyle:true,credentials:{accessKeyId:"s314local",secretAccessKey:"s314localsecret"}});
(async()=>{const l=await c.send(new ListObjectsV2Command({Bucket:"s314-live"}));
for(const o of (l.Contents||[])) await c.send(new DeleteObjectCommand({Bucket:"s314-live",Key:o.Key}));
console.log("  rig reset — bucket emptied ("+((l.Contents||[]).length)+" removed)");})();' 2>/dev/null
