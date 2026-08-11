import Foundation

public struct QuestionMock: Identifiable {
    public let id: String
    public let text: String
    public let options: [String]
    
    public init(id: String = UUID().uuidString, text: String, options: [String]) {
        self.id = id
        self.text = text
        self.options = options
    }
}
