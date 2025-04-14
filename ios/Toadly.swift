import UIKit
import NitroModules

class Toadly: HybridToadlySpec {
    private static var hasSetupBeenCalled = false
    static var shared: Toadly?

    private let bugReportController = BugReportController()
    private var jsLogs: String = ""
    private var screenshotData: Data?

    public func setup(githubToken: String, repoOwner: String, repoName: String) throws {
        if Toadly.hasSetupBeenCalled {
            return
        }

        Toadly.hasSetupBeenCalled = true
        Toadly.shared = self

        LoggingService.info("Setting up Toadly with GitHub integration...")
        GitHubService.setup(githubToken: githubToken, repoOwner: repoOwner, repoName: repoName)
        
        LoggingService.info("Setting up exception handler...")
        ExceptionHandlingService.setupExceptionHandler()
    }

    public func addJSLogs(logs: String) throws {
        self.jsLogs = logs
        LoggingService.info("Received JavaScript logs")
    }
    
    public func createIssueWithTitle(title: String, reportType: String?) throws {
        LoggingService.info("Creating GitHub issue with title: \(title)")
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            let details = "This issue was automatically generated by the Toadly error handling system."
            
            GitHubService.submitIssue(
                email: "toadly-bot",
                title: title,
                details: details,
                jsLogs: self.jsLogs,
                screenshotData: nil,
                reportType: reportType
            ) { result in
                switch result {
                case .success(let issueUrl):
                    LoggingService.info("Auto-generated GitHub Issue Created: \(issueUrl)")
                    print("Auto-generated GitHub Issue Created: \(issueUrl)")
                case .failure(let error):
                    LoggingService.error("Failed to create auto-generated GitHub issue: \(error.localizedDescription)")
                    print("Failed to create auto-generated GitHub issue: \(error.localizedDescription)")
                }
            }
        }
    }
    
    private func captureScreenshot() {
        LoggingService.info("Capturing screenshot")
        
        DispatchQueue.main.async {
            guard let keyWindow = UIApplication.shared.windows.first(where: { $0.isKeyWindow }) ?? UIApplication.shared.windows.first else {
                LoggingService.error("Failed to find key window for screenshot")
                return
            }
            
            let format = UIGraphicsImageRendererFormat()
            format.scale = UIScreen.main.scale
            format.opaque = false
            
            do {
                let renderer = UIGraphicsImageRenderer(bounds: keyWindow.bounds, format: format)
                
                let screenshot = renderer.image { context in
                    keyWindow.layer.render(in: context.cgContext)
                }
                
                // Convert the image to JPEG data
                if let imageData = screenshot.jpegData(compressionQuality: 0.8) {
                    self.screenshotData = imageData
                    LoggingService.info("Screenshot captured successfully")
                } else {
                    LoggingService.error("Failed to convert screenshot to JPEG data")
                }
            } catch {
                LoggingService.error("Error capturing screenshot: \(error.localizedDescription)")
            }
        }
    }

    public func show() throws {
        LoggingService.info("Showing bug report form")
        
        captureScreenshot()
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
            guard let self = self else { return }
            
            guard let rootViewController = self.getRootViewController() else {
                LoggingService.error("Failed to get root view controller")
                return
            }

            self.bugReportController.show(
                from: rootViewController,
                onSubmit: { [weak self] email, title, details, reportType in
                    guard let self = self else { return }
                    
                    LoggingService.info("Report submitted with type: \(reportType.rawValue), title: \(title)")
                    
                    GitHubService.submitIssue(
                        email: email,
                        title: title,
                        details: details,
                        jsLogs: self.jsLogs,
                        screenshotData: self.screenshotData,
                        reportType: reportType.rawValue,
                        completion: { result in
                            switch result {
                            case .success(let issueUrl):
                                LoggingService.info("Report Submitted to GitHub: \(issueUrl)")
                                print("Report Submitted to GitHub: \(issueUrl)")
                            case .failure(let error):
                                LoggingService.error("Failed to submit report to GitHub: \(error.localizedDescription)")
                                print("Failed to submit report to GitHub: \(error.localizedDescription)")
                            }
                        }
                    )
                },
                onCancel: {
                    LoggingService.info("Report submission cancelled")
                    print("Report submission cancelled")
                }
            )
        }
    }
    
    private func getRootViewController() -> UIViewController? {
        // Get the key window
        let keyWindow = UIApplication.shared.windows.first(where: { $0.isKeyWindow }) ?? UIApplication.shared.windows.first
        
        // Get the root view controller
        guard let rootViewController = keyWindow?.rootViewController else {
            return nil
        }
        
        // Find the top-most presented view controller
        var topController = rootViewController
        while let presentedController = topController.presentedViewController {
            topController = presentedController
        }
        
        return topController
    }
    
    public func crashNative() throws {
        CrashUtil.triggerCrash()
    }
}
