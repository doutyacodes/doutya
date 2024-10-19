import { Client } from 'basic-ftp';

export async function uploadToFtp(buffer, filePath) {
console.log(buffer, filePath);
    
  const ftpClient = new Client();

  try {
    await ftpClient.access({
      host: process.env.FTP_HOST, // Load from environment variables
      user: process.env.FTP_USER, // Load from environment variables
      password: process.env.FTP_PASSWORD, // Load from environment variables
      secure: false, // Change to true for FTPS (secure FTP) if needed
    });
    console.log('Connected to FTP server successfully.');
    
    // Upload the file to the remote server
    const logg = await ftpClient.uploadFrom(buffer, filePath);
    console.log("logg", logg);
    
    // Close FTP connection after upload
    ftpClient.close();
  } catch (error) {
    console.error('FTP upload failed:', error);
    throw new Error('FTP upload failed');
  }
}

export const FTP_BASE_PATH = "/public_html/xortlist"