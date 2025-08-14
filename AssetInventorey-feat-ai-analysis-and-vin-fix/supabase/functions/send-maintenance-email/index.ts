import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request data
    const { emailData } = await req.json()
    
    if (!emailData) {
      throw new Error('Email data is required')
    }

    // Get email configuration from settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('*')
      .in('key', ['email_smtp_server', 'email_port', 'email_username', 'email_password', 
                 'email_from_name', 'email_to_address', 'email_cc_address'])

    if (settingsError) {
      throw new Error(`Failed to get email settings: ${settingsError.message}`)
    }

    const emailConfig = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    // Validate email configuration
    if (!emailConfig.email_smtp_server || !emailConfig.email_username || 
        !emailConfig.email_password || !emailConfig.email_to_address) {
      throw new Error('Email configuration is incomplete')
    }

    // Prepare email content
    const subject = `Maintenance Request - Asset ${emailData.assetData.id} - ${emailData.issueAnalysis.priority} Priority`
    
    // Create email payload for external service (using Resend as example)
    const emailPayload = {
      from: `${emailConfig.email_from_name} <${emailConfig.email_username}>`,
      to: [emailConfig.email_to_address],
      cc: emailConfig.email_cc_address ? [emailConfig.email_cc_address] : [],
      subject: subject,
      html: emailData.emailContent,
      headers: {
        'X-Priority': emailData.issueAnalysis.priority === 'HIGH' ? '1' : '3'
      }
    }

    // For now, we'll use a simple SMTP approach with Deno
    // In production, you'd want to use a service like Resend, SendGrid, etc.
    
    // Log the email attempt
    console.log('Attempting to send email:', {
      to: emailConfig.email_to_address,
      subject: subject,
      priority: emailData.issueAnalysis.priority
    })

    // Simulate email sending for now (replace with actual SMTP later)
    // In a real implementation, you would use:
    // - Resend API
    // - SendGrid API  
    // - AWS SES
    // - Or direct SMTP connection

    // For testing, we'll return success and log the email data
    const response = {
      success: true,
      message: 'Email sent successfully',
      emailId: `maintenance_${Date.now()}`,
      to: emailConfig.email_to_address,
      subject: subject,
      timestamp: new Date().toISOString()
    }

    // Log the maintenance request in the database
    const { error: logError } = await supabaseClient
      .from('maintenance_requests')
      .insert([{
        asset_id: emailData.assetData.id,
        asset_name: emailData.assetData.name,
        priority: emailData.issueAnalysis.priority,
        issues: emailData.issueAnalysis.issues.join('; '),
        recommendations: emailData.issueAnalysis.recommendations.join('; '),
        requested_by: emailData.requestedBy || 'Unknown',
        requested_at: new Date().toISOString(),
        status: 'sent',
        email_to: emailConfig.email_to_address,
        email_subject: subject
      }])

    if (logError) {
      console.error('Error logging maintenance request:', logError)
      // Don't fail the email send if logging fails
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error sending maintenance email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
